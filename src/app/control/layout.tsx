import "@ant-design/v5-patch-for-react-19";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Ship Managment",
  description: "Ship Position Managment",
};
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return (
    <>
      <header className="header">
        {/* <div className="banner">Quản lý vị trí tàu</div> */}
        <div className="logo-banner">
          <Image src="/dvplogochuan.png" alt="Logo" width={100} height={100} />
          <div className="banner-text">
            <h1 style={{ textDecoration: "underline" }}>
              Công ty cổ phần đầu tư và phát triển Cảng Đình Vũ
            </h1>
            <h2>{`Hải Phòng, ngày ${day} tháng ${month} năm ${year}`}</h2>
          </div>
        </div>
      </header>

      <main>
        <div
          style={{
            backgroundImage: 'url("/background/background.png")',
          }}
        >
          {children}
        </div>
      </main>
    </>
  );
}
