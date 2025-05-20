import PortMapComponent from "@/components/PortMapComponent";
import ViewComponent from "@/components/ViewComponent";

export default function Home() {
  return (
    <div className="App">
      <div
        style={{
          background:
            'url("https://www.transparenttextures.com/patterns/asfalt-dark.png") repeat',
        }}
      >
        <ViewComponent />
      </div>
    </div>
  );
}
