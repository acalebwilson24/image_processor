'use client'
import React from 'react';
import useImageDropper from '@/hooks/useImageDropper';

const ImageDropper = () => {
    const { compressedImages, images, loading, handleDrop, handleDelete, clear, upload } = useImageDropper();

    return (
        <>
            <div className="border border-slate-800 grid gap-4 p-4 flex-wrap relative" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                {loading &&
                    <div className="absolute inset-0 bg-gray-500 opacity-50 flex justify-center items-center">
                        <div className="text-white">Processing images...</div>
                    </div>
                }
                {compressedImages ? compressedImages.map((i, index) => {
                    console.log(i)
                    if (!i) return null;
                    const src = i ? URL.createObjectURL(i) : "";
                    return (
                        <div key={i.name} className="flex flex-col items-center bg-slate-50 group p-2">
                            <img className="w-64 h-64 object-contain mb-4" src={src} alt={i.name} />
                            <span className="text-xs">{i.name}</span>
                            <button className="hidden group-hover:block absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600" onClick={() => handleDelete(index)}>Delete</button>
                        </div>
                    )
                }) : <div className="flex justify-center items-center h-12">Drop an image here</div>
                }
            </div>
            <div>
                <button className="bg-slate-800 text-white px-4 py-2 rounded" onClick={upload}>Upload</button>
                <button className="bg-slate-800 text-white px-4 py-2 rounded" onClick={clear}>Clear</button>
            </div>
        </>
    )
}

export default ImageDropper;