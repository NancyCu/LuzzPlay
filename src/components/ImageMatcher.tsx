import React, { useState, useEffect } from 'react';
import { PADDLES } from '../App';
import { CheckCircle2, RefreshCw } from 'lucide-react';

export default function ImageMatcher() {
    const [rawImages, setRawImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [matched, setMatched] = useState<Record<string, string>>({});
    const [selectedRaw, setSelectedRaw] = useState<string | null>(null);

    // We need to map 31 paddles, plus possibly the logo
    const TARGET_IMAGES = [
        ...PADDLES.map(p => p.imageUrl.replace('/images/', '')),
        'luzz-play-logo.png'
    ];

    const fetchImages = async () => {
        try {
            const res = await fetch('/api/unmapped-images');
            const data = await res.json();
            setRawImages(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleMatch = async (targetName: string) => {
        if (!selectedRaw) return;

        try {
            const res = await fetch('/api/match-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawName: selectedRaw, correctName: targetName })
            });

            if (res.ok) {
                setMatched(prev => ({ ...prev, [targetName]: selectedRaw }));
                setRawImages(prev => prev.filter(img => img !== selectedRaw));
                setSelectedRaw(null);
            }
        } catch (e) {
            console.error('Failed to match', e);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading images... Ensure server restarted.</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <div className="bg-indigo-600 text-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-display font-bold mb-4">Luzz Auto Matcher</h1>
                <p className="text-indigo-100">
                    Click an uploaded raw image on the left, then click the correct product name on the right to instantly pair them bridging the gap without files renaming.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Unmapped Raw Images */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[800px] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-6 sticky top-0 bg-white z-10 py-2 border-b">Raw Uploaded Images ({rawImages.length})</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {rawImages.map(img => (
                            <div
                                key={img}
                                onClick={() => setSelectedRaw(img)}
                                className={`cursor-pointer rounded-xl overflow-hidden border-4 transition-all duration-200 ${selectedRaw === img ? 'border-indigo-500 scale-105 shadow-md' : 'border-transparent hover:border-gray-200'}`}
                            >
                                <img src={`/images/${img}`} alt="Raw" className="w-full h-32 object-cover bg-gray-50" />
                                <p className="text-xs text-center p-2 truncate bg-gray-50 text-gray-500">{img}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Target Product Names */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[800px] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-6 sticky top-0 bg-white z-10 py-2 border-b">Target Products ({TARGET_IMAGES.length})</h2>

                    <div className="space-y-3">
                        {TARGET_IMAGES.map(target => {
                            const isMatched = matched[target];
                            const paddle = PADDLES.find(p => p.imageUrl.includes(target));

                            return (
                                <div
                                    key={target}
                                    onClick={() => !isMatched && handleMatch(target)}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isMatched
                                            ? 'bg-green-50 border-green-200 opacity-60'
                                            : selectedRaw
                                                ? 'cursor-pointer hover:border-indigo-400 border-gray-100 shadow-sm'
                                                : 'border-gray-100 opacity-50'
                                        }`}
                                >
                                    <div>
                                        <p className="font-bold text-gray-900">{paddle?.name || target}</p>
                                        <p className="text-sm font-mono text-gray-500">{target}</p>
                                    </div>

                                    {isMatched ? (
                                        <div className="flex items-center gap-2 text-green-600 font-medium">
                                            <span className="text-sm truncate max-w-[100px]">{matched[target]}</span>
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                    ) : (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedRaw ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <RefreshCw className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
