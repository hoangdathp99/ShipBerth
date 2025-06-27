'use client'
import useDailyDateUpdate from "@/hooks/getDate";
import Image from "next/image";
import { useState } from "react";

export default function Banner() {
  const [dateBerth, setDateBerth] = useState("");

  useDailyDateUpdate(setDateBerth);
  return (
    <div className="logo-banner">
      <Image src="/dvplogochuan.png" alt="Logo" width={100} height={100} />
      <div className="banner-text">
        <h1 style={{ textDecoration: "underline" }}>
          Công ty cổ phần đầu tư và phát triển Cảng Đình Vũ
        </h1>
        <h2>{`Vị trí tàu cập Cảng ngày ${dateBerth}`}</h2>
      </div>
    </div>
  );
}
