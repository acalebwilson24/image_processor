'use client'
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import useImageDropper, { IImageData } from '@/hooks/useImageDropper';
import _Image from 'next/image';
import { CropValues, Origin } from '@/types';
import CropOverlay from './CropOverlay';

const ImageDropper = () => {
    const { compressedImages, images, loading, handleDrop, handleDelete, clear, upload, setCropPosition } = useImageDropper()

    useEffect(() => {
        console.log(compressedImages)
    }, [compressedImages])

    return (
        <>
            <div className="border border-slate-800 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 p-4 flex-wrap relative" style={{ gridTemplateColumns: "" }} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                {loading &&
                    <div className="absolute inset-0 bg-gray-500 opacity-50 flex justify-center items-center">
                        <div className="text-white">Processing images...</div>
                    </div>
                }
                {compressedImages ? compressedImages.map((image, index) => {
                    if (!image || !image.url) {
                        console.log(image)
                        return <p>Error - {image?.file.name}</p>;
                    }
                    const { url, height, width, file, cropPosition } = image;
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

type ImageWithCropOverlayProps = {
    actualWidth: number;
    actualHeight: number;
    src: string;
    name: string;
    handleDelete: () => void;
    cropPosition?: CropValues;
    setCropPosition: (cropLocation: CropValues) => void;
};

const ImageWithCropOverlay = forwardRef<HTMLDivElement, ImageWithCropOverlayProps>(
    ({ actualHeight, actualWidth, src, handleDelete, setCropPosition, cropPosition, name }, ref) => {
        const testRef = React.createRef<HTMLDivElement>();
        const [width, setWidth] = useState(actualWidth);


        useEffect(() => {
            function handleResize() {
                if (testRef.current?.clientWidth) {
                    const maxWidth = testRef.current.clientWidth;
                    const imageWidth = actualWidth;
                    if (actualHeight > actualWidth) {
                        setWidth(maxWidth / (actualHeight / actualWidth));
                    } else {
                        console.log('setting width')
                        setWidth(maxWidth);
                    }
                }
            }

            handleResize();

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
            }
        }, [testRef, actualWidth])
        
        const height = width * (actualHeight/actualWidth);

        return (
            <div ref={testRef} className="flex flex-col items-center justify-center bg-slate-50 group relative aspect-square">
                <div style={{ width, height }} className="relative">
                    <img src={src} width={width} height={height} alt="" className="absolute top-0 left-0 w-full h-full" />
                    {cropPosition && <CropOverlay width={width} height={height} cropPosition={cropPosition} setCropPosition={setCropPosition} />}
                </div>
                {/* <span className="text-xs">{name}</span> */}
                <div className="hidden group-hover:block absolute top-0 right-0 p-2">
                    <button className="bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600" onClick={handleDelete}>
                        Delete
                    </button>
                </div>
            </div>
        );
    }
);

const _ImageWithCropOverlay = forwardRef<HTMLDivElement, ImageWithCropOverlayProps>(
    ({ actualHeight, actualWidth, src, handleDelete, setCropPosition, cropPosition, name }, ref) => {
      const canvasRef = useRef<HTMLCanvasElement>(null);
      const [width, setWidth] = useState(actualWidth);
  
      useEffect(() => {
        function handleResize() {
          if (canvasRef.current?.clientWidth) {
            const maxWidth = canvasRef.current.clientWidth;
            const imageWidth = actualWidth;
            if (actualHeight > actualWidth) {
              setWidth(maxWidth / (actualHeight / actualWidth));
            } else {
              setWidth(maxWidth);
            }
          }
        }
  
        handleResize();
  
        window.addEventListener('resize', handleResize);
  
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, [canvasRef, actualWidth]);
  
      const height = width * (actualHeight / actualWidth);
  
      useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
  
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
  
        const image = new Image();
        image.src = src;
        image.onload = () => {
          const scale = width / actualWidth;
          const scaledCropPosition = {
            x: cropPosition?.x ? cropPosition.x * scale : 0,
            y: cropPosition?.y ? cropPosition.y * scale : 0,
            width: cropPosition?.width ? cropPosition.width * scale : width,
            height: cropPosition?.height ? cropPosition.height * scale : height,
          };
          ctx.drawImage(image, 0, 0, actualWidth, actualHeight, 0, 0, width, height);
          if (cropPosition) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, width, height);
            ctx.clearRect(scaledCropPosition.x, scaledCropPosition.y, scaledCropPosition.width, scaledCropPosition.height);
          }
        };
      }, [canvasRef, src, actualWidth, actualHeight, width, height, cropPosition]);
  
      const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
  
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const scale = actualWidth / width;
        setCropPosition({
          x: x * scale,
          y: y * scale,
          width: 100,
          height: 100,
          ratio: 1,
        });
      };
  
      return (
        <div ref={ref} className="flex flex-col items-center justify-center bg-slate-50 group p-2 relative aspect-square">
          <canvas ref={canvasRef} width={width} height={height} onClick={handleCanvasClick} />
          <span className="text-xs">{name}</span>
          <div className="hidden group-hover:block absolute top-0 right-0 p-2">
            <button className="bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      );
    }
  ); 