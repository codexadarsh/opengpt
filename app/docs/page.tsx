import { ArrowUpRightIcon, File } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function EmptyDemo() {
  return (
    <div className="h-screen flex justify-center items-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ArrowUpRightIcon />
          </EmptyMedia>
          <EmptyTitle>Stay tuned</EmptyTitle>
          <EmptyDescription>we are working on it</EmptyDescription>
        </EmptyHeader>
        <EmptyContent></EmptyContent>
      </Empty>
    </div>
  );
}
