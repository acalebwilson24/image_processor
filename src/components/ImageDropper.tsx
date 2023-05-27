'use client'
import React, { useEffect, useState } from 'react';
import useImageDropper, { IImageData } from '@/hooks/useImageDropper';
import Image from 'next/image';

const ImageDropper = () => {
    const { compressedImages, images, loading, handleDrop, handleDelete, clear, upload } = useImageDropper();

    return (
        <>
            <div className="border border-slate-800 grid gap-4 p-4 flex-wrap relative" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                {loading &&
                    <div className="absolute inset-0 bg-gray-500 opacity-50 flex justify-center items-center">
                        <div className="text-white">Processing images...</div>
                    </div>
                }
                {compressedImages ? compressedImages.map((i, index) => {
                    if (!i) return null;
                    const src = i ? URL.createObjectURL(i.file) : "";
                    const width = i.width;
                    const height = i.height;
                    let actualWidth = 0;
                    let actualHeight = 0;

                    if (width > height) {
                        actualWidth = 300;
                        actualHeight = (height / width) * 300;
                    } else {
                        actualHeight = 300;
                        actualWidth = (width / height) * 300;
                    }

                    return (
                        <ImageThing actualHeight={actualHeight} actualWidth={actualWidth} i={i} src={src} handleDelete={() => handleDelete(index)} />
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

const ImageThing: React.FC<{
    i: IImageData;
    actualWidth: number;
    actualHeight: number;
    src: string;
    handleDelete: () => void;
}> = ({ i, actualHeight, actualWidth, src, handleDelete }) => {
    const mainImageRef = React.useRef<HTMLDivElement>(null);
    // x is left, y is top
    const [cropPosition, setCropPosition] = useState({ x: 10, y: 10, width: 100, height: 100 });
    const { x, y, width, height } = cropPosition;
    const [dragOffset, setIsDragging] = useState<{ x: number, y: number } | null>(null);
    const [dragHandlePosition, setDragHandlePosition] = useState<{ x: number, y: number } | null>(null);

    const leftBox = <div style={{ top: `${y}px`, left: 0, width: `${x}px`, height: `${height}px` }} className="LEFT absolute bg-slate-600/50"></div>
    const rightBox = <div style={{ top: `${y}px`, right: 0, width: `${actualWidth - x - width}px`, height: `${height}px` }} className="RIGHT absolute bg-slate-600/50"></div>
    const topBox = <div style={{ top: `0`, left: 0, width: `${actualWidth}px`, height: `${y}px` }} className="TOP absolute bg-slate-600/50"></div>
    const bottomBox = <div style={{ bottom: `0`, left: 0, width: `${actualWidth}px`, height: `${actualHeight - y - height}px` }} className="BOTTOM absolute bg-slate-600/50"></div>

    const centerBox = <div style={{ top: `${y}px`, left: `${x}px`, width: `${width}px`, height: `${height}px` }} className="CENTER absolute" onMouseDown={(e) => {
        e.preventDefault();
        const { clientX, clientY } = e;
        const { left, top } = e.currentTarget.getBoundingClientRect();
        const x = clientX - left;
        const y = clientY - top;
        setIsDragging({ x, y });
    }}>

    </div>

    const dragHandle = <div className='absolute' style={{ top: `${dragHandlePosition?.y || y}px`, left: `${x + (width / 2)}px`, width: `${20}px`, height: `${20}px`, transform: "translate(-50%, -150%)", background: "white" }} onMouseDown={(e) => {
        e.preventDefault();
        // get position of drag handle within imageRef
        const imageBox = mainImageRef.current?.getBoundingClientRect();
        if (!imageBox) return;
        const { clientX, clientY } = e;
        const { left, top } = imageBox;
        const x = clientX - left;
        const y = clientY - top + 20;
        setDragHandlePosition({ x, y });
    }}>

    </div>

    useEffect(() => {
        if (!dragOffset) return;
        const handleMouseMove = (e: MouseEvent) => {
            if (!mainImageRef.current) return;
            const { left, top } = mainImageRef.current.getBoundingClientRect();
            const x = Math.min(Math.max(e.clientX - left - dragOffset.x, 0), actualWidth - width);
            const y = Math.min(Math.max(e.clientY - top - dragOffset.y, 0), actualHeight - height);
            setCropPosition({ x, y, width, height });
        }
        const handleMouseUp = () => {
            setIsDragging(null);
        }
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [dragOffset, mainImageRef, width, height]);

    useEffect(() => {
        if (!dragHandlePosition) return;
        const handleMouseMove = (e: MouseEvent) => {
            const imageBox = mainImageRef.current?.getBoundingClientRect();
            if (!imageBox) return;
            const { clientX, clientY } = e;
            const { left, top } = imageBox;
            let newY = clientY - top + 20
            let difference = y - newY;
            let minH = 40;
            let minW = 40;
            let maxW = actualWidth;
            let maxH = actualHeight;
            let aspectRatio = width / height;

            let newHeight = height + (difference * 2)
            let newWidth = width + (difference * 2)

            // limit width and height
            if (newHeight < minH) {
                newHeight = minH;
                newY = y;
            } else if (newHeight > maxH) {
                newHeight = maxH;
                newY = y;
            }

            if (newWidth < minW) {
                newWidth = minW;
            } else if (newWidth > maxW) {
                newWidth = maxW;
            }

            // constrain aspect ratio
            if (newWidth / newHeight > aspectRatio) {
                newWidth = newHeight * aspectRatio;
            } else if (newWidth / newHeight < aspectRatio) {
                newHeight = newWidth / aspectRatio;
                newY = y;
            }

            // limit x and y
            let newX = x - (0.5 * (newWidth - width));
            if (newX < 0) newX = 0;
            if (newX + newWidth > actualWidth) newX = actualWidth - newWidth;

            if (newY < 0) newY = 0;
            if (newY + newHeight > actualHeight) newY = actualHeight - newHeight;


            setCropPosition({ ...cropPosition, y: newY, height: newHeight, width: newWidth, x: newX });
            setDragHandlePosition({ x: newX, y: newY, });
        }
        const handleMouseUp = () => {
            setDragHandlePosition(null);
        }
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [dragHandlePosition])

    return (
        <div className="flex flex-col items-center justify-center bg-slate-50 group p-2 relative">
            <div style={{ width: actualWidth, height: actualHeight }} className='relative' ref={mainImageRef}>
                <Image src={src} width={actualWidth} height={actualHeight} alt="" className='absolute top-0 left-0' />
                {leftBox}
                {rightBox}
                {topBox}
                {bottomBox}
                {centerBox}
                {dragHandle}
            </div>
            <span className="text-xs">{i.file.name}</span>
            <div className='hidden group-hover:block absolute top-0 right-0 p-2'>
                <button className="bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600" onClick={handleDelete}>Delete</button>
            </div>
        </div>
    )
}
