declare module "react-plotly.js" {
  import * as React from "react";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Plot: React.ComponentType<any>;
  export default Plot;
}

declare module "plotly.js-dist-min" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Plotly: any;
  export default Plotly;
}

