import * as React from 'react';
import { ISimpleShape } from '../../../Interfaces/interfaces';

export function Line (simpleShape : ISimpleShape) 
{
    // Auxiliary values
    let relCornerCoord = {x1:0, y1:0, x2:simpleShape.rect[2]-simpleShape.rect[0], y2:simpleShape.rect[3]-simpleShape.rect[1]};
    let relCenterCoord = {x:simpleShape.center[0]-simpleShape.rect[0], y:simpleShape.center[1]-simpleShape.rect[1]};
    let edge = 1;
    
    return(
    <div style={{position:"absolute", left:simpleShape.rect[0], top:simpleShape.rect[1], width:relCornerCoord.x2+2*edge, height:relCornerCoord.y2+2*edge}}>
        <svg width={relCornerCoord.x2+2*edge} height={relCornerCoord.y2+2*edge}>   
            <line
                x1={relCornerCoord.x1}
                y1={relCornerCoord.y2}
                x2={relCornerCoord.x2}
                y2={relCornerCoord.y1}
                stroke={simpleShape.frame_color}
            />
        </svg>
    </div>
    )
}