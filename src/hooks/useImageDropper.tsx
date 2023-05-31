import { CropValues } from '@/types';
import { useState, useEffect } from 'react';

export interface IImageData {
    file: File;
    url: string;
    width: number;
    height: number;
}

export type IImageDataWithCrop  = IImageData & {
    cropPosition: CropValues;
}

const useImageDropper = () => {
    const [images, setImages] = useState<IImageData[] | null>(null);
    const [compressedImages, setCompressedImages] = useState<IImageDataWithCrop[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (images) {
            setLoading(true);
            const compressedImages: IImageDataWithCrop[] = [];
            const crops: CropValues[] = [];

            const compressImage = (imageData: IImageData, index: number) => {
                const { file } = imageData;
                const img = new Image();
                const reader = new FileReader();

                reader.onload = (e: ProgressEvent<FileReader>) => {
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d')!;
                        const MAX_WIDTH = 800;
                        const MAX_HEIGHT = 600;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;

                        ctx.drawImage(img, 0, 0, width, height);

                        canvas.toBlob((blob) => {
                            const compressedFile = new File([blob!], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });

                            const compressedImageData: IImageDataWithCrop = {
                                file: compressedFile,
                                url: URL.createObjectURL(compressedFile),
                                width,
                                height,
                                cropPosition: {
                                    x: width > height ? ((width - height) / 2) / width : 0,
                                    y: width > height ? 0 : ((height - width) / 2) / height,
                                    width: width > height ? height / width : 1,
                                    height: width > height ? 1 : width / height,
                                    ratio: width / height
                                }
                            };

                            compressedImages[index] = compressedImageData;

                            setCompressedImages([...compressedImages]);

                            if (compressedImages.length === images.length) {
                                setLoading(false);
                            }
                        }, 'image/jpeg', 0.7);
                    };
                    img.src = e.target!.result as string;
                };
                reader.readAsDataURL(file);
            };

            for (let i = 0; i < images.length; i++) {
                compressImage(images[i], i);
            }
        } else {
            setCompressedImages(null);
        }
    }, [images]);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = e.dataTransfer.files;

        const imageFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.match('image.*')) {
                imageFiles.push(file);
            }
        }

        const imageDatas: IImageData[] = [];
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e: ProgressEvent<FileReader>) => {
                img.onload = () => {
                    const imageData: IImageData = {
                        file,
                        width: img.width,
                        height: img.height,
                        url: e.target!.result as string
                    };
                    imageDatas.push(imageData);

                    if (imageDatas.length === imageFiles.length) {
                        setImages(imageDatas);
                    }
                };
                img.src = e.target!.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = (index: number) => {
        if (images && compressedImages) {
            const newImages = [...images];
            const newCompressedImages = [...compressedImages];
            newImages.splice(index, 1);
            newCompressedImages.splice(index, 1);
            setImages(newImages);
            setCompressedImages(newCompressedImages);
        }
    };

    const clear = () => {
        setImages(null);
        setCompressedImages(null);
    };

    const upload = () => {
        if (compressedImages) {
            // TODO: Implement image upload logic
        }
    };

    // const setCropPosition = (index: number, cropLocation: CropValues) => {
    //     if (crops) {
    //         const newCrops = [...crops];
    //         newCrops[index] = cropLocation;
    //         setCrops(newCrops);
    //     }
    // };

    const setCropPosition = (index: number, cropLocation: CropValues) => {
        if (compressedImages) {
            const newCompressedImages = [...compressedImages];
            const newCrop = {...newCompressedImages[index].cropPosition, ...cropLocation};
            newCompressedImages[index].cropPosition = newCrop;
            setCompressedImages(newCompressedImages);
        }
    }

    return { images, compressedImages, loading, handleDrop, handleDelete, clear, upload, setCropPosition };
};

export default useImageDropper;