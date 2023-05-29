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

type CropValues = {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** Resizes the image while maintaining the aspect ratio by pinning
     *  the y value a given newY.
     *  The height is then transformed to be twice the moved distance (by comparing newY to currentY) to maintain the position of the crop about the center.
     *  The width is then calculated to maintain the aspect ratio, along with new values of x to again maintain the center of the crop.
     * @param newY The new y value of the crop section
     * @returns The new crop position (after the transform and constraints are applied)
     */
function scaleImageByYTransform(newY: number, currentCrop: CropValues, options: {
    minH?: number;
    minW?: number;
    maxW?: number;
    maxH?: number;
}): CropValues {
    const { x, y, width, height } = currentCrop;
    let difference = y - newY;
    let { minH = 0, minW = 0, maxW, maxH } = options;
    let newHeight = height + (difference * 2)
    let newWidth = width + (difference * 2)

    // limit width and height
    if (newHeight < minH) {
        newHeight = minH;
        newY = y;
    } else if (maxH && newHeight > maxH) {
        newHeight = maxH;
        newY = y;
    }

    if (newWidth < minW) {
        newWidth = minW;
    } else if (maxW && newWidth > maxW) {
        newWidth = maxW;
    }

    // limit x and y
    let newX = x - (0.5 * (newWidth - width));
    if (newX < 0) newX = 0;
    if (maxW && newX + newWidth > maxW) newX = maxW - newWidth;

    return { x: newX, y: newY, width: newWidth, height: newHeight };
}

function constrainByAspectRatio(newCropValues: CropValues, originalCropValues: CropValues): CropValues {
    let { x, y, width, height } = newCropValues;
    const aspectRatio = originalCropValues.width / originalCropValues.height;
    if (width / height > aspectRatio) {
        width = height * aspectRatio;
        x = originalCropValues.x;
    } else if (width / height < aspectRatio) {
        height = width / aspectRatio;
        y = originalCropValues.y;
    }
    return { x, y, width, height };
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
    const [cropPosition, _setCropPosition] = useState<CropValues>({
        x: actualWidth > actualHeight ? (actualWidth - actualHeight) / 2 : 0,
        y: actualHeight > actualWidth ? (actualHeight - actualWidth) / 2 : 0,
        width: actualWidth > actualHeight ? actualHeight : actualWidth,
        height: actualHeight > actualWidth ? actualWidth : actualHeight
    });
    const { x, y, width, height } = cropPosition;
    const [dragOffset, setIsDragging] = useState<{ x: number, y: number } | null>(null);
    const [topDragHandlePosition, setTopDragHandlePosition] = useState<Pick<CropValues, "x" | "y"> | null>(null);
    const [cornerIsDragging, setCornerIsDragging] = useState<boolean>(false);

    function setCropPosition(newCropPosition: CropValues) {
        let { x, y, width, height } = newCropPosition;
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x + width > actualWidth) x = actualWidth - width;
        if (y + height > actualHeight) y = actualHeight - height;
        if (width > actualWidth) width = actualWidth;
        if (height > actualHeight) height = actualHeight;

        _setCropPosition({ x, y, width, height });

        return { x, y, width, height };
    }



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

    const dragHandle = <div className='absolute' style={{ top: `${topDragHandlePosition?.y || y}px`, left: `${x + (width / 2)}px`, width: `${20}px`, height: `${20}px`, transform: "translate(-50%, -50%)", background: "white" }} onMouseDown={(e) => {
        e.preventDefault();
        // get position of drag handle within imageRef
        const imageBox = mainImageRef.current?.getBoundingClientRect();
        if (!imageBox) return;
        const { clientX, clientY } = e;
        const { left, top } = imageBox;
        const x = clientX - left;
        const y = clientY - top;
        setTopDragHandlePosition({ x, y });
    }}>
    </div>

    const cornerDragHandle = <div className='absolute' style={{
        top: `${y + height}px`,
        left: `${x + width}px`,
        width: `${20}px`, height: `${20}px`,
        transform: "translate(-50%, -50%)",
        background: "white"
    }} onMouseDown={(e) => {
        e.preventDefault();
        setCornerIsDragging(true);
    }}></div>

    useEffect(() => {
        if (!dragOffset) return;
        const handleMouseMove = (e: MouseEvent) => {
            if (!mainImageRef.current) return;
            const { left, top } = mainImageRef.current.getBoundingClientRect();
            const x = e.clientX - left - dragOffset.x
            const y = e.clientY - top - dragOffset.y
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
        if (!topDragHandlePosition) return;
        const handleMouseMove = (e: MouseEvent) => {
            const imageBox = mainImageRef.current?.getBoundingClientRect();
            if (!imageBox) return;

            const { clientY } = e;
            const { top } = imageBox;
            let newY = clientY - top
            let difference = y - newY
            let scale = 1 + (difference / (height / 2))
            let center = { x: x + width / 2, y: y + height / 2 }

            const newCoords = scaleAboutOrigin(scale, cropPosition, center, { maxX: actualWidth, maxY: actualHeight })
            setCropPosition(newCoords)
            setTopDragHandlePosition(newCoords)

            // const scaledByYTransform = scaleImageByYTransform(newY, cropPosition, {
            //     minH: 40,
            //     minW: 40,
            //     maxW: actualWidth,
            //     maxH: actualHeight
            // });
            // const constrainedByAspectRatio = constrainByAspectRatio(scaledByYTransform, cropPosition);
            // setCropPosition(constrainedByAspectRatio);
            // setDragHandlePosition(constrainedByAspectRatio);
        }
        const handleMouseUp = () => {
            setTopDragHandlePosition(null);
        }
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [topDragHandlePosition])


    useEffect(() => {
        if (!cornerIsDragging) return;
        const handleMouseMove = (e: MouseEvent) => {
            console.log(cropPosition)
            const imageBox = mainImageRef.current?.getBoundingClientRect();
            if (!imageBox) return;

            const { clientY, clientX } = e;
            const { top, left } = imageBox;

            let newX = (clientX - left)
            let newY = (clientY - top)

            let origin = { x: x, y: y }

            let differenceX = newX - (x + width)
            let differenceY = newY - (y + height)
            let dimension: "x" | "y" = "x";
            let difference = 0;
            if (differenceX < 0) {
                if (differenceY > 0) {
                    difference = 0;
                } else {
                    if (differenceX < differenceY) {
                        difference = differenceY
                        dimension = "y"
                    } else {
                        difference = differenceX
                        dimension = "x"
                    }
                }
            } else {
                if (differenceX > differenceY) {
                    difference = differenceX
                    dimension = "x"
                } else {
                    difference = differenceY
                    dimension = "y"
                }
            }

            let handleLocation = { x: x + width, y: y + height }
            let distanceFromOriginToHandle = { x: handleLocation.x - origin.x, y: handleLocation.y - origin.y }

            let direction = -1
            if (differenceX > 0) {
                direction = 1
            }

            let scaleX = (difference + distanceFromOriginToHandle.x) / distanceFromOriginToHandle.x
            let scaleY = (difference + distanceFromOriginToHandle.y) / distanceFromOriginToHandle.y

            const newCoords = scaleAboutOrigin(dimension == "x" ? scaleX : scaleY, cropPosition, origin, { maxX: actualWidth, maxY: actualHeight })
            setCropPosition(newCoords)
        }

        const handleMouseUp = () => {
            setCornerIsDragging(false);
        }
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [cornerIsDragging])
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
                {cornerDragHandle}
            </div>
            <span className="text-xs">{i.file.name}</span>
            <div className='hidden group-hover:block absolute top-0 right-0 p-2'>
                <button className="bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600" onClick={handleDelete}>Delete</button>
            </div>
        </div>
    )
}


function scaleAboutOrigin(factor: number, initialValues: CropValues, origin: { x: number, y: number }, constraints: { maxX: number, maxY: number }): CropValues {
    const { x, y, width, height } = initialValues;

    let newX = origin.x * (1 - factor) + x * factor
    let newY = origin.y * (1 - factor) + y * factor
    let newWidth = width * factor
    let newHeight = height * factor

    if (newWidth > constraints.maxX) {
        newWidth = constraints.maxX
        newX = 0;
        newY = y;
        newHeight = height;
    } else if (newWidth < 10) {
        newWidth = 10
        newX = x;
        newY = y;
        newHeight = width / height * newWidth;
    }

    if (newHeight > constraints.maxY) {
        newHeight = constraints.maxY
        newY = 0;
        newX = x;
        newWidth = width;
    } else if (newHeight < 10) {
        newHeight = 10
        newY = y;
        newX = x;
        newWidth = height / width * newHeight;
    }


    return {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
    }
}