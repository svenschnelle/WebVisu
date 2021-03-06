import ComSocket from '../../../communication/comsocket';
import { IPolyObject } from '../../../Interfaces/jsinterfaces';
import { IPolyShape } from '../../../Interfaces/javainterfaces';
import {
    numberToHexColor,
    computeMinMaxCoord,
    pointArrayToPiechartString,
} from '../../Utils/utilfunctions';

export function createPolyObject(
    polyShape: IPolyShape,
    dynamicElements: Map<string, string[][]>,
): IPolyObject {
    // absCornerCoord are the absolute coordinates of the <div> element in relation to the origin in the top left
    let absCornerCoord = {
        x1: polyShape.rect[0],
        y1: polyShape.rect[1],
        x2: polyShape.rect[2],
        y2: polyShape.rect[3],
    };
    // absCenterCoord are the coordinates of the rotation and scale center
    let absCenterCoord = {
        x: polyShape.center[0],
        y: polyShape.center[1],
    };
    // relCoord are the width and the height in relation the div
    let relCoord = {
        width: polyShape.rect[2] - polyShape.rect[0],
        height: polyShape.rect[3] - polyShape.rect[1],
    };
    // the relCenterCoord are the coordinates of the midpoint of the div
    let relMidpointCoord = {
        x: (polyShape.rect[2] - polyShape.rect[0]) / 2,
        y: (polyShape.rect[3] - polyShape.rect[1]) / 2,
    };
    // The line_width is 0 in the xml if border width is 1 in the codesys dev env. Otherwise line_width is equal to the target border width. Very strange.
    let edge = polyShape.line_width === 0 ? 1 : polyShape.line_width;
    // Compute the strokeWidth through has_frame_color
    let lineWidth = polyShape.has_frame_color ? edge : 0;
    // Compute the fill color through has_fill_color
    let fillColor = polyShape.has_inside_color
        ? polyShape.fill_color
        : 'none';
    // Tooltip
    let tooltip = polyShape.tooltip;
    let relPoints = [] as number[][];
    polyShape.points.forEach(function (item, index) {
        relPoints.push([
            item[0] - absCornerCoord.x1,
            item[1] - absCornerCoord.y1,
        ]);
    });

    // Create an object with the initial parameters
    let initial: IPolyObject = {
        // Variables will be initialised with the parameter values
        normalFillColor: polyShape.fill_color,
        alarmFillColor: polyShape.fill_color_alarm,
        normalFrameColor: polyShape.frame_color,
        alarmFrameColor: polyShape.frame_color_alarm,
        hasFillColor: polyShape.has_inside_color,
        hasFrameColor: polyShape.has_frame_color,
        lineWidth: lineWidth,
        // Positional arguments
        absCornerCoord: absCornerCoord,
        absCenterCoord: absCenterCoord,
        absPoints: polyShape.points,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        xpos: 0,
        ypos: 0,
        scale: 1000, // a scale of 1000 means a representation of 1:1
        angle: 0,
        // Activate / deactivate input
        eventType: 'visible',
        // Computed
        fill: fillColor,
        edge: edge,
        stroke: polyShape.frame_color,
        strokeDashArray: '0',
        display: 'visible' as any,
        alarm: false,
        tooltip: tooltip,
        strokeWidth: lineWidth,
        // Transformed corner coordinates, relative width and height
        transformedCornerCoord: absCornerCoord,
        relCoord: relCoord,
        relMidpointCoord: relMidpointCoord,
        // Transformed coordintes for polyhapes only
        cssTransform: '',
        cssTransformOrigin: '',
        relPoints: relPoints,
        // Access variables
        writeAccess: true,
        readAccess: true,
    };

    // Processing the variables for visual elements
    // A <expr-..-> tag initiate a variable, const or a placeholder
    // We have to implement the const value, the variable or the placeholdervalue if available for the static value
    // Polyshapes and Simpleshapes have the same <expr-...> possibilities

    if (dynamicElements.has('expr-toggle-color')) {
        let element = dynamicElements.get('expr-toggle-color');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = () => {
            let value = returnFunc();
            return value;
        };
        Object.defineProperty(initial, 'alarm', {
            get: () => wrapperFunc(),
        });
    }
    // 2) Set fill color
    if (dynamicElements.has('expr-fill-color')) {
        let element = dynamicElements!.get('expr-fill-color');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = () => {
            let value = returnFunc();
            let hexcolor = numberToHexColor(value);
            return hexcolor;
        };
        Object.defineProperty(initial, 'normalFillColor', {
            get: () => wrapperFunc(),
        });
    }
    // 3) Set alarm color
    if (dynamicElements.has('expr-fill-color-alarm')) {
        let element = dynamicElements!.get('expr-fill-color-alarm');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = () => {
            let value = returnFunc();
            let hexcolor = numberToHexColor(value);
            return hexcolor;
        };
        Object.defineProperty(initial, 'alarmFillColor', {
            get: () => wrapperFunc(),
        });
    }
    // 4) Set frame color
    if (dynamicElements.has('expr-frame-color')) {
        let element = dynamicElements!.get('expr-frame-color');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = () => {
            let value = returnFunc();
            let hexcolor = numberToHexColor(value);
            return hexcolor;
        };
        Object.defineProperty(initial, 'normalFrameColor', {
            get: () => wrapperFunc(),
        });
    }
    // 5) Set alarm frame color
    if (dynamicElements.has('expr-frame-color-alarm')) {
        let element = dynamicElements!.get('expr-frame-color-alarm');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = () => {
            let value = returnFunc();
            let hexcolor = numberToHexColor(value);
            return hexcolor;
        };
        Object.defineProperty(initial, 'alarmFrameColor', {
            get: () => wrapperFunc(),
        });
    }

    // 6) Set invisible state
    if (dynamicElements.has('expr-invisible')) {
        let element = dynamicElements!.get('expr-invisible');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = () => {
            let value = returnFunc();
            if (value !== undefined) {
                if (value == 0) {
                    return 'visible';
                } else {
                    return 'hidden';
                }
            }
        };
        Object.defineProperty(initial, 'display', {
            get: () => wrapperFunc(),
        });
    }
    // 7) Set fill flag state
    if (dynamicElements.has('expr-fill-flags')) {
        let element = dynamicElements!.get('expr-fill-flags');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = () => {
            let value = returnFunc();
            if (value == '1') {
                return false;
            } else {
                return true;
            }
        };
        Object.defineProperty(initial, 'hasFillColor', {
            get: () => wrapperFunc(),
        });
    }
    // 8) Set frame flag state
    if (dynamicElements.has('expr-frame-flags')) {
        let element = dynamicElements!.get('expr-frame-flags');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'hasFrameColor', {
            get: function () {
                let value = returnFunc() == '8' ? false : true;
                return value;
            },
        });
        Object.defineProperty(initial, 'strokeDashArray', {
            get: function () {
                let value = returnFunc();
                if (initial.lineWidth <= 1) {
                    if (value == '4') {
                        return '20,10,5,5,5,10';
                    } else if (value == '3') {
                        return '20,5,5,5';
                    } else if (value == '2') {
                        return '5,5';
                    } else if (value == '1') {
                        return '10,10';
                    } else {
                        return '0';
                    }
                } else {
                    return '0';
                }
            },
        });
    }
    // 9) line-width
    if (dynamicElements.has('expr-line-width')) {
        let element = dynamicElements!.get('expr-line-width');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = () => {
            let value = returnFunc();
            let width = Number(value);
            if (width == 0) {
                return 1;
            } else {
                return width;
            }
        };
        Object.defineProperty(initial, 'lineWidth', {
            get: () => wrapperFunc(),
        });
    }

    // 10) Left-Position
    if (dynamicElements.has('expr-left')) {
        let element = dynamicElements!.get('expr-left');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'left', {
            get: () => returnFunc(),
        });
    }
    // 11) Right-Position
    if (dynamicElements.has('expr-right')) {
        let element = dynamicElements!.get('expr-right');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'right', {
            get: () => returnFunc(),
        });
    }
    // 12) Top-Position
    if (dynamicElements.has('expr-top')) {
        let element = dynamicElements!.get('expr-top');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'top', {
            get: () => returnFunc(),
        });
    }
    // 13) Bottom-Position
    if (dynamicElements.has('expr-bottom')) {
        let element = dynamicElements!.get('expr-bottom');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'bottom', {
            get: () => returnFunc(),
        });
    }
    // 14) x-Position
    if (dynamicElements.has('expr-xpos')) {
        let element = dynamicElements!.get('expr-xpos');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'xpos', {
            get: () => returnFunc(),
        });
    }
    // 15) y-Position
    if (dynamicElements.has('expr-ypos')) {
        let element = dynamicElements!.get('expr-ypos');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'ypos', {
            get: () => returnFunc(),
        });
    }
    // 16) Scaling
    if (dynamicElements.has('expr-scale')) {
        let element = dynamicElements!.get('expr-scale');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'scale', {
            get: () => returnFunc(),
        });
    }
    // 17) Rotating
    if (dynamicElements.has('expr-angle')) {
        let element = dynamicElements!.get('expr-angle');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'angle', {
            get: () => returnFunc(),
        });
    }
    // 18) Tooltip
    if (dynamicElements.has('expr-tooltip-display')) {
        let element = dynamicElements!.get('expr-tooltip-display');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'tooltip', {
            get: () => returnFunc(),
        });
    }
    // 19) Deactivate Input
    if (dynamicElements.has('expr-input-disabled')) {
        let element = dynamicElements!.get('expr-input-disabled');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = () => {
            let value = returnFunc();
            if (value == '1') {
                return 'none';
            } else {
                return 'visible';
            }
        };
        Object.defineProperty(initial, 'eventType', {
            get: () => wrapperFunc(),
        });
    }

    // We have to compute the dependent values after all the required static values ​​have been replaced by variables, placeholders or constant values
    // E.g. the fillcolor depends on hasFillColor and alarm. This variables are called "computed" values. MobX will track their dependents and rerender the object by change.
    // We have to note that the rotation of polylines is not the same like simpleshapes. Simpleshapes keep their originally alignment, polyhapes transform every coordinate.

    // The fill color
    Object.defineProperty(initial, 'fill', {
        get: function () {
            if (initial.alarm == false) {
                if (initial.hasFillColor) {
                    return initial.normalFillColor;
                } else {
                    return 'none';
                }
            } else {
                return initial.alarmFillColor;
            }
        },
    });
    Object.defineProperty(initial, 'strokeWidth', {
        get: function () {
            return initial.lineWidth;
        },
    });

    Object.defineProperty(initial, 'stroke', {
        get: function () {
            if (initial.alarm == false) {
                if (initial.hasFrameColor) {
                    return initial.normalFrameColor;
                } else {
                    return 'none';
                }
            } else {
                return initial.alarmFrameColor;
            }
        },
    });

    Object.defineProperty(initial, 'edge', {
        get: function () {
            if (initial.hasFrameColor || initial.alarm) {
                if (initial.lineWidth == 0) {
                    return 1;
                } else {
                    return initial.lineWidth;
                }
            } else {
                return 0;
            }
        },
    });

    Object.defineProperty(initial, 'transformedCornerCoord', {
        get: function () {
            let corners = computeMinMaxCoord(initial.absPoints);
            return {
                x1: corners[0],
                y1: corners[1],
                x2: corners[2],
                y2: corners[3],
            };
        },
    });

    Object.defineProperty(initial, 'relCoord', {
        get: function () {
            let width =
                initial.transformedCornerCoord.x2 -
                initial.transformedCornerCoord.x1;
            let height =
                initial.transformedCornerCoord.y2 -
                initial.transformedCornerCoord.y1;
            return { width: width, height: height };
        },
    });

    Object.defineProperty(initial, 'relPoints', {
        get: function () {
            let points = initial.absPoints;
            let interim = [];
            let xoff =
                initial.transformedCornerCoord.x1 - initial.edge;
            let yoff =
                initial.transformedCornerCoord.y1 - initial.edge;
            for (let i = 0; i < points.length; i++) {
                let x = points[i][0] - xoff;
                let y = points[i][1] - yoff;
                interim.push([x, y]);
            }
            return interim;
        },
    });

    Object.defineProperty(initial, 'cssTransformOrigin', {
        get: function () {
            let interim = ('' +
                (absCenterCoord.x - absCornerCoord.x1) +
                'px ' +
                (absCenterCoord.y - absCornerCoord.y1) +
                'px ') as string;
            return interim;
        },
    });

    Object.defineProperty(initial, 'cssTransform', {
        get: function () {
            let scale = initial.scale / 1000;
            let interim =
                'scale(' +
                scale +
                ') rotate(' +
                initial.angle +
                'deg) translate(' +
                initial.xpos +
                'px, ' +
                initial.ypos +
                'px)';
            return interim;
        },
    });

    // Define the object access variables
    Object.defineProperty(initial, 'writeAccess', {
        get: function () {
            let current = ComSocket.singleton().oVisuVariables.get(
                '.currentuserlevel',
            )!.value;
            let currentNum = Number(current);
            if (currentNum !== NaN) {
                if (
                    polyShape.access_levels[currentNum].includes('w')
                ) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
    });

    Object.defineProperty(initial, 'readAccess', {
        get: function () {
            let current = ComSocket.singleton().oVisuVariables.get(
                '.currentuserlevel',
            )!.value;
            let currentNum = Number(current);
            if (currentNum !== NaN) {
                if (
                    polyShape.access_levels[currentNum].includes('r')
                ) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
    });

    return initial;
}
