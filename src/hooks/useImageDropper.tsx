import { useState, useEffect } from 'react';

const useImageDropper = () => {
    const [images, setImages] = useState<File[] | null>(null);
    const [compressedImages, setCompressedImages] = useState<File[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (images) {
            setLoading(true);
            const compressedImages: File[] = [];

            const compressImage = (file: File, index: number) => {
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
                            compressedImages[index] = compressedFile;
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
        setImages(Array.from(files));
    }

    const handleDelete = (index: number) => {
        const newImages = [...images!];
        newImages.splice(index, 1);
        setImages(newImages);
    }

    const clear = () => {
        setImages(null);
        setCompressedImages(null);
    }

    const upload = () => {
        // TODO: Implement upload logic
    }

    return { compressedImages, images, loading, handleDrop, handleDelete, clear, upload };
}

export default useImageDropper;