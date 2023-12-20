import { BaseLayout } from "./BaseLayout";

export const Error = ({ code, error }: { code: number; error: string }) => {
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
          {code}
        </h1>
        <p
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#000",
          }}
        >
          {error}
        </p>
      </main>
    </BaseLayout>
  );
};
