"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  defaultDropAnimation,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { createSnapModifier } from "@dnd-kit/modifiers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ShipPositionComponent from "./ShipPositionComponent";
import { socket } from "@/lib/socketClient";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const RulerComponent = () => {
  const [rulerLengthMeters, setRulerLengthMeters] = useState(625);
  const [start, setStart] = useState(-100);
  const step = 5;
  const containerRef = useRef(null) as any;

  // Define the margin (in pixels) to keep outside the ruler on both left and right sides
  const margin = 20;
  const [tickMarks, setTickMarks] = useState([]);
  const [scale, setScale] = useState(1);
  const [activeId, setActiveId] = useState<any>(null);
  const snapToRuler = useMemo(() => createSnapModifier(step * scale), [scale]);
  const ZoomHandle = () => {
    setRulerLengthMeters((prev) => prev + 50);
    setStart((prev) => prev - 25);
  };
  const ZoomOutHandle = () => {
    if (rulerLengthMeters === 425) return;
    setRulerLengthMeters((prev) => prev - 50);
    setStart((prev) => prev + 25);
  };

  useEffect(() => {
    let j = 0;
    let arr = [];
    const end = rulerLengthMeters + start;

    for (let i = start; i <= end; i += step) {
      const meterValue = i;
      const leftPosition = margin + j * scale; // position relative to container
      j += step;
      arr.push(
        meterValue % 25 === 0 ? (
          <div
            key={i}
            style={{
              position: "absolute",
              left: leftPosition,
              bottom: "calc(10vh - 18px)",
              transform: "translateX(-50%)",
              textAlign: "center",
              // zIndex:50
            }}
          >
            {meterValue === 0 && start != 0 ? (
              <div
                style={{
                  width: "2px",
                  height: "30vh",
                  backgroundColor: "#CCCCCC",
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: "calc(30vh + 20px)",
                    width: "max-content",
                    // transform: "translateX(-100%)",
                    color: "#FFFFFF",
                  }}
                >
                  <div style={{ transform: "translateX(-100%)" }}>
                    PTSC Port
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      width: "200px",
                      top: "15px",
                      transform: "translateX(-100%)",
                      // left: "-130px",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <hr />
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "-10px",
                          transform: "translateY(-50%)",
                        }}
                      >
                        <LeftOutlined />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : meterValue === 425 && start != 0 ? (
              <div
                style={{
                  width: "2px",
                  height: "30vh",
                  backgroundColor: "#CCCCCC",
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: "calc(30vh + 20px)",
                    width: "max-content",
                    color: "#FFFFFF",
                  }}
                >
                  Tân Vũ Port
                  <div
                    style={{
                      position: "absolute",
                      width: "200px",
                      top: "15px",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <hr />
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: "-10px",
                          transform: "translateY(-50%)",
                        }}
                      >
                        <RightOutlined />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  width: "2px",
                  height: "20px",
                  backgroundColor: "#CCCCCC",
                  margin: "0 auto",
                }}
              ></div>
            )}
            <div
              style={{
                fontSize: "12px",
                marginTop: "2px",
                minWidth: "max-content",
                color: "#FFFFFF",
              }}
            >
              {meterValue}
            </div>
          </div>
        ) : (
          <div
            key={i}
            style={{
              position: "absolute",
              left: leftPosition,
              bottom: "10vh",
              transform: "translateX(-50%)",
              textAlign: "center",
              zIndex: 50,
            }}
          >
            <div
              style={{
                width: "1px",
                height: "10px",
                backgroundColor: "#CCCCCC",
                margin: "0 auto",
              }}
            ></div>
          </div>
        )
      );
    }
    setTickMarks(arr as any);
  }, [rulerLengthMeters, start, scale]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const cw = containerRef.current.clientWidth;
        // setContainerWidth(cw);
        const effectiveWidth = cw - 2 * margin;
        const newScale = effectiveWidth / rulerLengthMeters;
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [rulerLengthMeters, margin]);

  const effectiveRulerWidthPixels = rulerLengthMeters * scale; // effective width of the ruler
  const [ships, setShips] = useState() as any;
  const handleDragEnd = useCallback(
    ({ active, delta }: any) => {
      const draggedShip = ships.findIndex((ship: any) => ship.id === active.id);
      const arr = [...ships];
      const calPos = arr[draggedShip].position.x + delta.x / scale;
      arr[draggedShip].position.x = calPos;
      setShips(arr);
      setActiveId(null);
      socket.emit("updateShip", arr);
    },
    [scale, ships]
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );
  useEffect(() => {
    const handleShipData = (data: any) => {
      setShips(data);
    };

    if (socket.connected) {
      // Nếu đã kết nối, gán listener ngay
      socket.on("shipData", handleShipData);
      socket.emit("requestShipData"); // Chủ động yêu cầu dữ liệu
    } else {
      // Nếu chưa kết nối, chờ connect rồi mới gán listener
      socket.on("connect", () => {
        socket.on("shipData", handleShipData);
        socket.emit("requestShipData");
      });
    }

    return () => {
      socket.off("shipData", handleShipData);
    };
  }, []);
  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
      onWheel={(e) => {
        if (e.deltaY > 0) {
          ZoomOutHandle();
        } else {
          ZoomHandle();
        }
      }}
    >
      {/* <div style={{width:"100%",display:"flex",justifyContent:"center",gap:"10px"}}> */}

      {/* </div> */}
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[snapToRuler]} // Apply snapping
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragEnd={({ active, delta }) => {
          handleDragEnd({ active, delta });
        }}
        sensors={sensors}
      >
        <div
          style={{
            position: "absolute",
            bottom: "10vh",
            left: margin,
            width: effectiveRulerWidthPixels,
            height: "2px",
            backgroundColor: "#FFA500",
            zIndex: 50,
          }}
        ></div>
        {tickMarks}
        {ships?.map((ship: any) => (
          <ShipPositionComponent
            key={ship.id}
            ship={ship}
            scale={scale}
            id={ship.id as any}
            start={start}
          />
        ))}
        <DragOverlay dropAnimation={defaultDropAnimation}>
          {(() => {
            const activeShip = ships?.find((ship: any) => ship.id === activeId);
            return activeShip ? (
              <ShipPositionComponent
                ship={activeShip}
                overlay={true}
                scale={scale}
                id={activeId || ""}
                start={start}
              />
            ) : null;
          })()}
        </DragOverlay>
      </DndContext>
      {/* </> */}
    </div>
  );
};

export default RulerComponent;
