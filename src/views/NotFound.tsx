import { BaseLayout } from "./BaseLayout";

export const NotFound = () => {
  return (
    <BaseLayout>
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100vw",
          flexDirection: "column",
          fontFamily: "sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "8rem",
            fontWeight: "bold",
            color: "#000",
          }}
        >
          404
        </h1>
        <p
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#000",
          }}
        >
          Page not found
        </p>
      </main>
    </BaseLayout>
  );
};
