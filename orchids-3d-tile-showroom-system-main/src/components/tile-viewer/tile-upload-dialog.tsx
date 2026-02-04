"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useTileStore } from "@/lib/store/tile-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import type { TileCategory, TileFinish, Tile } from "@/lib/db/schema";

interface TileUploadDialogProps {
  trigger?: React.ReactNode;
}

export function TileUploadDialog({ trigger }: TileUploadDialogProps) {
  const addTile = useTileStore((state) => state.addTile);
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TileCategory>("floor");
  const [width, setWidth] = useState("600");
  const [height, setHeight] = useState("600");
  const [finish, setFinish] = useState<TileFinish>("matte");
  const [collection, setCollection] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedUrl(data.imageUrl);
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const resetForm = () => {
    setName("");
    setCategory("floor");
    setWidth("600");
    setHeight("600");
    setFinish("matte");
    setCollection("");
    setPreviewUrl(null);
    setUploadedUrl(null);
  };

  const handleSubmit = async () => {
    if (!name || !uploadedUrl) return;

    const newTile: Tile = {
      id: crypto.randomUUID(),
      name,
      category,
      width: parseInt(width),
      height: parseInt(height),
      finish,
      imageUrl: uploadedUrl,
      thumbnailUrl: uploadedUrl,
      collection: collection || null,
      color: null,
      isPreloaded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to local store
    addTile(newTile);

    // Also save to backend
    try {
      await fetch("/api/tiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTile),
      });
    } catch (error) {
      console.error("Failed to save tile:", error);
    }

    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Upload Tile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload New Tile</DialogTitle>
          <DialogDescription>
            Add a new tile to your collection by uploading an image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mx-auto max-h-32 rounded object-cover"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-0 right-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewUrl(null);
                    setUploadedUrl(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                {isUploading && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Uploading...
                  </p>
                )}
                {uploadedUrl && (
                  <p className="text-sm text-green-600 mt-2">Upload complete</p>
                )}
              </div>
            ) : (
              <>
                <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? "Drop the image here"
                    : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WebP up to 10MB
                </p>
              </>
            )}
          </div>

          {/* Tile details form */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="tile-name">Tile Name *</Label>
              <Input
                id="tile-name"
                placeholder="e.g., Classic Marble"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={(v: TileCategory) => setCategory(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="floor">Floor</SelectItem>
                    <SelectItem value="wall">Wall</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Finish</Label>
                <Select
                  value={finish}
                  onValueChange={(v: TileFinish) => setFinish(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="glossy">Glossy</SelectItem>
                    <SelectItem value="matte">Matte</SelectItem>
                    <SelectItem value="textured">Textured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="width">Width (mm)</Label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (mm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collection">Collection (Optional)</Label>
              <Input
                id="collection"
                placeholder="e.g., Marble, Wood, Ceramic"
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !uploadedUrl || isUploading}
          >
            Add Tile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
