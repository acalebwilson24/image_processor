/**
 * x: % of the image width
 * y: % of the image height
 * width: % of the image width
 * height: % of the image height
 * ratio: width / height
 */
export type CropValues = {
    x: number;
    y: number;
    width: number;
    height: number;
    ratio: number;
}

export type Origin = {
    originX: number;
    originY: number;
    originXProportion: number;
    originYProportion: number;
}