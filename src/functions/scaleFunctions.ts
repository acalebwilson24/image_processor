import { CropValues, Origin } from "@/types";

/**
 * Calculates the scaled coordinates of the crop area based on the factor and origin.
 * 
 * Derived from the conversion to a 2d vector coordinate system about the origin,
 * calculating the scaled (by the scalar factor variable) of the vectors associated with each
 * corner of the crop area, then converting back into the original coordinate system.
 * 
 * The necessary calculations were then isolated and simplified, resulting in these
 * final values.
 * This allows the scaling of the crop based on an arbitrary origin of x and y.
 * @param factor The factor by which to scale the crop area
 * @param newValues The initial values of the crop area
 * @param origin The origin of the scaling (based on the same axes as the crop area - not taking 0,0 to be the top left of the crop area, but rather the top left of the image)
 */
export function getScaledCoordinates(newValues: CropValues, origin: Origin, factor: number): CropValues {
    const { x, y, width, height, ratio } = newValues;
    const { originX, originY } = origin;

    let newX = originX * (1 - factor) + x * factor
    let newY = originY * (1 - factor) + y * factor
    let newWidth = width * factor
    let newHeight = height * factor

    return {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        ratio: ratio
    }
}

/**
 * Constrains the values of the crop area to the given constraints. Maintains the aspect ratio of the crop area. 
 * 
 * @param newValues Values to be constrained
 * @param constraints Maximum values for each coordinate
 * @returns The constrained values
 */
export function getConstrainedCoordinates(newValues: CropValues, origin: Origin, constraints: { maxX: number, maxY: number, minX?: number, minY?: number }) {
    const { x, y, width, height, ratio } = newValues;
    const minX = constraints.minX || 0.1;
    const minY = constraints.minY || 0.1;

    let newX = x,
        newY = y,
        newWidth = width,
        newHeight = height;

    if (newWidth > 1) {
        newWidth = 1
        newHeight = ratio * newWidth;
        newX = origin.originX - (origin.originXProportion * newWidth);
        newY = origin.originY - (origin.originYProportion * newHeight);
    } else if (newWidth < minX) {
        newWidth = minX
        newHeight = ratio * newWidth;
        newX = origin.originX - (origin.originXProportion * newWidth);
        newY = origin.originY - (origin.originYProportion * newHeight);
    }

    if (newHeight > 1) {
        newHeight = 1
        newWidth = (1 / ratio) * newHeight;
        newY = 0;
        newX = origin.originX - (origin.originXProportion * newWidth);
    } else if (newHeight < minY) {
        newHeight = minY
        newWidth = (1 / ratio) * newHeight;
        newY = origin.originY - (origin.originYProportion * newHeight);
        newX = origin.originX - (origin.originXProportion * newWidth);
    }

    return {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        ratio: ratio
    }
}