import { getScaledCoordinates, getConstrainedCoordinates } from "@/functions/scaleFunctions";
import { CropValues, Origin } from "@/types";
import { useState, useEffect } from "react";

/**
 * This hook is used to handle the crop overlay - dragging and resizing. It handles updating the passed in crop position through the setCropPosition function.
 * @param setCropPosition update the crop position
 * @param cropPosition the current crop position
 * @param ref the ref of the overlay (which is the same size as the image)
 * @returns 
 */
function useCropOverlay(setCropPosition: (cropPosition: CropValues) => void, cropPosition: CropValues, ref: React.RefObject<HTMLDivElement>) {
    // drag offset is used to indicate dragging
    const [dragOffset, setDragOffset] = useState<{ x: number, y: number } | null>(null);
    // resize origin is used to indicate resizing
    const [resizeOrigin, setResizeOrigin] = useState<Origin | null>(null);

    function setLocalCrop(newCropPosition: CropValues) {
        let { x, y, width: cropWidth, height: cropHeight, ratio } = newCropPosition;
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x + cropWidth > 1) x = 1 - cropWidth;
        if (y + cropHeight > 1) y = 1 - cropHeight;
        if (cropWidth > 1) cropWidth = 1;
        if (cropHeight > 1) cropHeight = 1;

        setCropPosition({ x, y, width: cropWidth, height: cropHeight, ratio });
        return { x, y, width: cropWidth, height: cropHeight };
    }

    useEffect(() => {
        if (!dragOffset) return;
        const handleMouseMove = (e: MouseEvent) => {
            if (!ref.current) return;
            const { left, top, width, height } = ref.current.getBoundingClientRect();
            const x = (e.clientX - left - dragOffset.x) / width
            const y = (e.clientY - top - dragOffset.y) / height
            setLocalCrop({ x, y, width: cropPosition.width, height: cropPosition.height, ratio: cropPosition.ratio });
        }
        const handleMouseUp = () => {
            setDragOffset(null);
        }
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [dragOffset]);

    useEffect(() => {
        if (!resizeOrigin) return;
        const handleMouseMove = (e: MouseEvent) => {
            const imageBox = ref.current?.getBoundingClientRect();
            if (!imageBox) return;

            const { clientY } = e;
            const { top, height } = imageBox;
            let newY = ((clientY - top) / height)
            let differenceY = cropPosition.y - newY
            let differenceX = differenceY / cropPosition.ratio
            console.log("differenceY", differenceY, "differenceX", differenceX)
            // needs investigating
            let scale = ((cropPosition.height + differenceY) * (cropPosition.width + differenceX)) / (cropPosition.height * cropPosition.width)

            const newCoords = getScaledCoordinates(cropPosition, resizeOrigin, scale)
            const constrainedCoords = getConstrainedCoordinates(newCoords, resizeOrigin, { maxX: 1, maxY: 1 })
            setLocalCrop(constrainedCoords)
        }

        const handleMouseUp = () => {
            setResizeOrigin(null);
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [resizeOrigin])

    return { setLocalCrop, setResizeOrigin, dragOffset, setDragOffset }
}

export default useCropOverlay;