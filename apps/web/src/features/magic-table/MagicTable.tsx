import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FilmIcon,
  CameraIcon,
  SlidersHorizontalIcon,
  Wand2Icon,
  XIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type BlockType = "color" | "exposure" | "film" | "utility";

interface ParamBlock {
  id: string;
  type: BlockType;
  label: string;
  value: number; // numeric value (-3 to 3 for now)
  bypass: boolean;
}

// A tiny helper for unique IDs
const uid = (() => {
  let i = 0;
  return () => `blk_${++i}`;
})();

// Icon map for dock & tiles
const iconFor: Record<BlockType, React.ReactElement> = {
  color: <CameraIcon className="w-5 h-5" />,
  exposure: <SlidersHorizontalIcon className="w-5 h-5" />,
  film: <FilmIcon className="w-5 h-5" />,
  utility: <Wand2Icon className="w-5 h-5" />,
};

// -----------------------------------------------------------------------------
// Dock (left toolbar)
// -----------------------------------------------------------------------------

const Dock = ({ onAdd }: { onAdd: (b: ParamBlock) => void }) => {
  const blockDefs: Array<Pick<ParamBlock, "type" | "label">> = [
    { type: "color", label: "Color Space" },
    { type: "exposure", label: "Exposure" },
    { type: "film", label: "Film Look" },
    { type: "utility", label: "Utility" },
  ];

  return (
    <aside className="flex flex-col gap-4 p-2 w-20 bg-gray-900 text-gray-100">
      {blockDefs.map((def) => (
        <Button
          key={def.type}
          variant="ghost"
          className="flex flex-col items-center gap-1 py-3 hover:bg-gray-800"
          onClick={() =>
            onAdd({ id: uid(), type: def.type, label: def.label, value: 0, bypass: false })
          }
        >
          {iconFor[def.type]}
          <span className="text-[10px] leading-tight text-center">
            {def.label}
          </span>
        </Button>
      ))}
    </aside>
  );
};

// -----------------------------------------------------------------------------
// Tile – draggable / reorderable block on workspace table
// -----------------------------------------------------------------------------

const InnerTile = ({ block, onRemove, onUpdate }: { block: ParamBlock; onRemove: () => void; onUpdate: (b: ParamBlock) => void }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative"
    >
      <Card className="w-56">
        <CardHeader className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {iconFor[block.type]}
            <CardTitle className="text-sm font-medium">
              {block.label}
            </CardTitle>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onRemove}
            className="h-6 w-6 text-gray-500 hover:text-red-500"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pb-4 px-4 text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <span className="w-12">Value</span>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.01}
              value={block.value}
              onChange={(e) => onUpdate({ ...block, value: parseFloat(e.target.value) })}
              className="flex-1"
            />
            <span className="w-10 text-right tabular-nums">
              {block.value.toFixed(2)}
            </span>
          </div>
          <Button
            size="sm"
            variant={block.bypass ? "destructive" : "secondary"}
            onClick={() => onUpdate({ ...block, bypass: !block.bypass })}
          >
            {block.bypass ? "Bypassed" : "Bypass"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Sortable wrapper
const SortableTile = ({ block, onRemove, onUpdate }: { block: ParamBlock; onRemove: () => void; onUpdate: (b: ParamBlock) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <InnerTile block={block} onRemove={onRemove} onUpdate={onUpdate} />
    </div>
  );
};

// -----------------------------------------------------------------------------
// MiniPreview – before/after slider placeholder
// -----------------------------------------------------------------------------

const MiniPreview = () => (
  <div className="relative h-1/2 border-b border-gray-700">
    <div className="absolute inset-0 flex items-center justify-center text-gray-600">
      <span className="text-xs">Preview A/B (todo)</span>
    </div>
  </div>
);

// -----------------------------------------------------------------------------
// PuzzleMeter – 4-dot status bar
// -----------------------------------------------------------------------------

const Dot = ({ ok }: { ok: boolean }) => (
  <div
    className={`h-3 w-3 rounded-full ${ok ? "bg-green-400" : "bg-red-500"}`}
  />
);

const PuzzleMeter = ({
  hasInput,
  hasArt,
  hasOutput,
}: {
  hasInput: boolean;
  hasArt: boolean;
  hasOutput: boolean;
}) => (
  <div className="flex items-center gap-2 p-2 text-xs bg-gray-900 border-t border-gray-700">
    <span className="font-medium">Checklist:</span>
    <Dot ok={hasInput} /> <span>IDT</span>
    <Dot ok={hasArt} /> <span>Look</span>
    <Dot ok={hasOutput} /> <span>ODT</span>
    <Dot ok={hasInput && hasArt && hasOutput} /> <span>Ready</span>
  </div>
);

// -----------------------------------------------------------------------------
// DiscoveryModal – placeholder for quick wizard (toggles via state)
// -----------------------------------------------------------------------------

const DiscoveryModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>TODO: Ask 3 questions and auto-build blocks.</p>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// -----------------------------------------------------------------------------
// MagicTable – root component for the new UI
// -----------------------------------------------------------------------------

export default function MagicTable() {
  const [blocks, setBlocks] = useState<ParamBlock[]>([]);
  const [showWizard, setShowWizard] = useState(false);

  const addBlock = (b: ParamBlock) => setBlocks((prev) => [...prev, b]);
  const removeBlock = (id: string) => setBlocks((prev) => prev.filter((b) => b.id !== id));

  // DnD setup
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  // Simple checklist logic – demo only
  const hasInput = blocks.some((b) => b.type === "color");
  const hasOutput = blocks.some((b) => b.type === "utility"); // pretend utility == ODT for demo
  const hasArt = blocks.some((b) => b.type === "film" || b.type === "exposure");

  return (
    <div className="flex h-screen text-gray-100 bg-gray-800">
      {/* Dock */}
      <Dock onAdd={addBlock} />

      {/* Workspace */}
      <main className="flex-1 overflow-auto p-6">
        {blocks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 select-none">
            <p className="text-center max-w-xs">
              Drag blocks from the toolbar <br /> to start building your LUT.
            </p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <motion.div layout className="flex flex-wrap gap-4">
                {blocks.map((block) => (
                  <SortableTile
                    key={block.id}
                    block={block}
                    onRemove={() => removeBlock(block.id)}
                    onUpdate={(b) => setBlocks((prev) => prev.map((pb) => (pb.id === b.id ? b : pb)))}
                  />
                ))}
              </motion.div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      {/* Sidebar */}
      <aside className="w-72 flex flex-col bg-gray-900 border-l border-gray-700">
        <MiniPreview />
        <div className="flex-1 p-4 text-gray-400 text-xs">Live code preview (todo)</div>
        <Button onClick={() => setShowWizard(true)} className="m-4">
          Need Help? Quick Start
        </Button>
      </aside>

      {/* Bottom Status Bar */}
      <div className="absolute bottom-0 inset-x-0">
        <PuzzleMeter hasInput={hasInput} hasArt={hasArt} hasOutput={hasOutput} />
      </div>

      {/* Discovery Wizard */}
      <DiscoveryModal open={showWizard} onClose={() => setShowWizard(false)} />
    </div>
  );
} 