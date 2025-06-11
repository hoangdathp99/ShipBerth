"use client";

import { socket } from "@/lib/socketClient";
import { useEffect, useRef, useState } from "react";
import ShipPositionComponent from "./ShipPositionComponent";
import "../styles/ship.scss";
const ViewComponent = () => {
  const [rulerLengthMeters, setRulerLengthMeters] = useState(625);
  const [start, setStart] = useState(-100);
  const step = 5;
  const containerRef = useRef(null) as any;

  // Define the margin (in pixels) to keep outside the ruler on both left and right sides
  const margin = 20;
  const [tickMarks, setTickMarks] = useState([]);
  const [scale, setScale] = useState(1);
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const ZoomHandle = () => {
    setRulerLengthMeters((prev) => prev + 50);
    setStart((prev) => prev - 25);
  };
  const ZoomOutHandle = () => {
    if (rulerLengthMeters === 425) return;
    setRulerLengthMeters((prev) => prev - 50);
    setStart((prev) => prev + 25);
  };
  const handleRefresh = async () => {
    setCacheBuster(Date.now()); // force new timestamp, reselect data with new image URL
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
              bottom: "160px",
              transform: "translateX(-50%)",
              textAlign: "center",
            }}
          >
            {meterValue === 0 && start != 0 ? (
              <div
                style={{
                  width: "2px",
                  height: "500px",
                  backgroundColor: "#CCCCCC",
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: "520px",
                    width: "max-content",
                    transform: "translateX(-100%)",
                    color: "#FFFFFF",
                  }}
                >
                  PTSC Port
                </div>
              </div>
            ) : meterValue === 425 && start != 0 ? (
              <div
                style={{
                  width: "2px",
                  height: "500px",
                  backgroundColor: "#CCCCCC",
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: "520px",
                    width: "max-content",
                    color: "#FFFFFF",
                  }}
                >
                  Tân Vũ Port
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
              bottom: "178px",
              transform: "translateX(-50%)",
              textAlign: "center",
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
    socket.on("message", (data) => {
      if ((data = "updatedImage")) {
        handleRefresh();
      }
    });

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
      <div className="fish-container">
        {Array(8)
          .fill(0)
          .map((_, i) => {
            return (
              <div
                key={i}
                className="fish-x"
                style={{
                  position: "absolute",
                  bottom: `calc(${Math.random() * 80+10}% - 50px)`,
                  left: `-20px`,
                  animation: `move-x ${Math.random() * 10 + 20}s linear ${
                    i * 3
                  }s infinite`,
                }}
              >
                <div
                  className="fish-y"
                  style={{
                    animation: `wave-y 3s ease-in-out infinite`,
                  }}
                >
                  <img
                    src={`/images/fish${i%2?1:2}.gif`}
                    alt="fish"
                    className="fish"
                    style={{
                      width: "20px",
                    }}
                  />
                </div>
              </div>
            );
          })}
      </div>
      {/* </div> */}
      <div
        style={{
          position: "absolute",
          bottom: "178px",
          left: margin,
          width: effectiveRulerWidthPixels,
          height: "2px",
          backgroundColor: "#FFA500",
        }}
      ></div>
      {tickMarks}
      {ships?.length > 0 &&
        ships?.map(
          (ship: {
            id: string;
            length: number;
            image: string;
            shipName: string;
            position: { x: number; y: number };
            dateBerth: string;
            timeBerth: string;
          }) => (
            <ShipPositionComponent
              viewMode={true}
              key={ship?.id}
              ship={ship}
              scale={scale}
              id={ship?.id as any}
              start={start}
              cacheBuster={cacheBuster}
            />
          )
        )}
      {/* </> */}
    </div>
  );
};

export default ViewComponent;
