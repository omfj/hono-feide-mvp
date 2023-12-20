export const BaseLayout = ({ children }: { children: JSX.Element }) => {
  return (
    <>
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
        `}
      </style>
      {children}
    </>
  );
};
