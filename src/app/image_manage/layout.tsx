import "@ant-design/v5-patch-for-react-19";
import type { Metadata } from "next";
import "../globals.css";


export const metadata: Metadata = {
  title: "Ship Image Managment",
  description: "Ship Image Managment",
};
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="header">Quản lý ảnh tàu</header>
      <main style={{ paddingTop: "50px" }}>{children}</main>
    </>
  );
}
