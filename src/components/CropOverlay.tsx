import useCropOverlay from "@/hooks/useCropOverlay";
import { CropValues } from "@/types";
import React from "react";

type CropOverlayProps = {
    cropPosition: CropValues;
    setCropPosition: (cropPosition: CropValues) => void;
    width: number;
    height: number;
}

const CropOverlay: React.FC<CropOverlayProps> = ({
    cropPosition,
    setCropPosition
}) => {
    const ref = React.useRef<HTMLDivElement>(null);
    
    // const [localCrop, _setLocalCrop] = useState<CropValues | null>(cropPosition);
    const { setLocalCrop, dragOffset, setResizeOrigin, setDragOffset } = useCropOverlay(setCropPosition, cropPosition, ref);
    
    if (cropPosition) {
        const { x, y, width: cropWidth, height: cropHeight } = cropPosition;
        // console.log({ x, y, cropWidth, cropHeight })

        const leftBox = <div style={{ top: `${y*100}%`, left: 0, width: `${x * 100}%`, height: `${cropHeight*100}%` }} className="LEFT absolute bg-slate-600/50"></div>
        const rightBox = <div style={{ top: `${y*100}%`, right: 0, width: `${100 - ((x + cropWidth)*100)}%`, height: `${cropHeight * 100}%` }} className="RIGHT absolute bg-slate-600/50"></div>
        const topBox = <div style={{ top: `0`, left: 0, width: `${100}%`, height: `${y * 100}%` }} className="TOP absolute bg-slate-600/50"></div>
        const bottomBox = <div style={{ bottom: `0`, left: 0, width: `${100}%`, height: `${100 - ((y + cropHeight) * 100)}%` }} className="BOTTOM absolute bg-slate-600/50"></div>

        const centerBox = <div style={{ top: `${y*100}%`, left: `${x*100}%`, width: `${cropWidth*100}%`, height: `${cropHeight*100}%` }} className="CENTER absolute" onMouseDown={(e) => {
            e.preventDefault();
            const { clientX, clientY } = e;
            const { left, top } = e.currentTarget.getBoundingClientRect();
            const x = clientX - left;
            const y = clientY - top;
            setDragOffset({ x, y });
        }}>
        </div>

        const dragHandle = <div className='absolute' style={{ top: `${y*100}%`, left: `${(x + (cropWidth / 2)) * 100}%`, width: `${20}px`, height: `${20}px`, transform: "translate(-50%, -50%)", background: "white" }} onMouseDown={(e) => {
            e.preventDefault();
            const originX = cropPosition.x + cropPosition.width / 2
            const originY = cropPosition.y + cropPosition.height / 2
            const originXProportion = (originX - cropPosition.x) / cropWidth;
            const originYProportion = (originY - cropPosition.y) / cropHeight;
            console.log({ originX, originY, originXProportion, originYProportion })
            setResizeOrigin({ originX, originY, originXProportion, originYProportion });
            setLocalCrop({ ...cropPosition });
        }}>
        </div>

        return (
            <div className='absolute top-0 left-0 w-full h-full' ref={ref}>
                {leftBox}
                {rightBox}
                {topBox}
                {bottomBox}
                {centerBox}
                {dragHandle}
            </div>
        )
    }

    return (
        <div className='absolute top-0 left-0 w-full h-full' ref={ref}>
            
        </div>
    )

    return null;
}

export default CropOverlay;