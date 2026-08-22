import { barY, defineChart } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";

import type { VisibilityBucket } from "$lib/posts/labels";

export function createVisibilityChart(rows: VisibilityBucket[]) {
  return defineChart(
    {
      marks: [
        barY(rows, {
          x: "label",
          y: "value",
          fill: "#d7a77e",
          inset: 2,
          radius: 6,
        }),
      ],
      x: {
        scale: () => scaleBand<string>().padding(0.24),
      },
      y: {
        scale: scaleLinear,
        nice: true,
        grid: true,
        axis: { label: "Posts" },
      },
    },
    { tooltip },
  );
}
