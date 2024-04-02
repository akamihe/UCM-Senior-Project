import dynamic from "next/dynamic";

const AppNoSSR = dynamic(() => import("./App"), { ssr: false }); // this is temporary

export default function App() {
  return (
    <html lang="en">
      <head>
        <title>Senior Project App, Paper game</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossOrigin="anonymous"></link>
        <style>
          {`p { margin: 0 }`}
        </style>
      </head>
      <body>
        <AppNoSSR />
      </body>
    </html>
  )
}