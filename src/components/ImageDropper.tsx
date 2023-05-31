'use client'
import React, { useEffect, useState } from 'react';
import useImageDropper, { IImageData } from '@/hooks/useImageDropper';
import Image from 'next/image';
import { CropValues, Origin } from '@/types';
import CropOverlay from './CropOverlay';

const ImageDropper = () => {
    const { compressedImages, images, loading, handleDrop, handleDelete, clear, upload, setCropPosition } = useImageDropper()

    return (
        <>
            <div className="border border-slate-800 grid gap-4 p-4 flex-wrap relative" style={{ gridTemplateColumns: "" }} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                {loading &&
                    <div className="absolute inset-0 bg-gray-500 opacity-50 flex justify-center items-center">
                        <div className="text-white">Processing images...</div>
                    </div>
                }
                {compressedImages ? compressedImages.map(({ url, width, height, file, cropPosition }, index) => {
                    // let actualWidth = 0;
                    // let actualHeight = 0;

                    // if (width > height) {
                    //     actualWidth = 300;
                    //     actualHeight = (height / width) * 300;
                    // } else {
                    //     actualHeight = 300;
                    //     actualWidth = (width / height) * 300;
                    // }

                    return (
                        <ImageWithCropOverlay name={file.name} cropPosition={cropPosition} setCropPosition={(cropPosition) => setCropPosition(index, cropPosition)} key={url} actualHeight={height} actualWidth={width} src={url} handleDelete={() => handleDelete(index)} />
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

const ImageWithCropOverlay: React.FC<{
    actualWidth: number;
    actualHeight: number;
    src: string;
    name: string;
    handleDelete: () => void;
    cropPosition?: CropValues;
    setCropPosition: (cropLocation: CropValues) => void;
}> = ({ actualHeight, actualWidth, src, handleDelete, setCropPosition, cropPosition, name }) => {

    return (
        <div className="flex flex-col items-center justify-center bg-slate-50 group p-2 relative">
            <div style={{ width: actualWidth, height: actualHeight }} className='relative'>
                <Image src={src} width={actualWidth} height={actualHeight} alt="" className='absolute top-0 left-0' />
                {cropPosition && <CropOverlay width={actualWidth} height={actualHeight} cropPosition={cropPosition} setCropPosition={setCropPosition} />}
            </div>
            <span className="text-xs">{name}</span>
            <div className='hidden group-hover:block absolute top-0 right-0 p-2'>
                <button className="bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600" onClick={handleDelete}>Delete</button>
            </div>
        </div>
    )
}