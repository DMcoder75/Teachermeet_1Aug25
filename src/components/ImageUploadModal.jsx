import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  Crop, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Check,
  Image as ImageIcon,
  Folder,
  Trash2,
  Edit3,
  Move,
  Square,
  Circle
} from 'lucide-react';

function ImageUploadModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  uploadType = 'profile', // 'profile' or 'cover'
  currentImage = null,
  title = "Upload Image"
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedImage, setEditedImage] = useState(null);
  const [cropSettings, setCropSettings] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    zoom: 1,
    rotation: 0
  });
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0
  });
  const [uploading, setUploading] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Get recommended dimensions based on upload type
  const getRecommendedSize = () => {
    if (uploadType === 'profile') {
      return { width: 400, height: 400, aspectRatio: '1:1' };
    } else if (uploadType === 'cover') {
      return { width: 1200, height: 300, aspectRatio: '4:1' };
    }
    return { width: 800, height: 600, aspectRatio: '4:3' };
  };

  const recommendedSize = getRecommendedSize();

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsEditing(true);
  }, []);

  // Handle drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  // Apply image filters and transformations
  const applyImageEdits = useCallback(() => {
    if (!previewUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas size based on upload type
      canvas.width = recommendedSize.width;
      canvas.height = recommendedSize.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply filters
      ctx.filter = `
        brightness(${filters.brightness}%) 
        contrast(${filters.contrast}%) 
        saturate(${filters.saturation}%) 
        blur(${filters.blur}px)
      `;

      // Calculate crop and zoom
      const { x, y, width, height, zoom, rotation } = cropSettings;
      
      // Save context
      ctx.save();
      
      // Apply rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Draw image with crop and zoom
      const sourceX = (img.width * x) / 100;
      const sourceY = (img.height * y) / 100;
      const sourceWidth = (img.width * width) / 100;
      const sourceHeight = (img.height * height) / 100;

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Restore context
      ctx.restore();

      // Convert to blob
      canvas.toBlob((blob) => {
        setEditedImage(blob);
      }, 'image/jpeg', 0.9);
    };

    img.src = previewUrl;
  }, [previewUrl, cropSettings, filters, recommendedSize]);

  // Apply edits when settings change
  React.useEffect(() => {
    if (isEditing && previewUrl) {
      applyImageEdits();
    }
  }, [isEditing, previewUrl, cropSettings, filters, applyImageEdits]);

  // Handle upload
  const handleUpload = async () => {
    if (!editedImage && !selectedFile) return;

    try {
      setUploading(true);
      
      const fileToUpload = editedImage || selectedFile;
      const result = await onUpload(fileToUpload);
      
      // Add to gallery
      const newGalleryItem = {
        id: Date.now(),
        url: result.url || URL.createObjectURL(fileToUpload),
        name: selectedFile.name,
        type: uploadType,
        uploadedAt: new Date().toISOString()
      };
      
      setGallery(prev => [newGalleryItem, ...prev]);
      
      // Reset and close
      handleClose();
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
    setEditedImage(null);
    setCropSettings({ x: 0, y: 0, width: 100, height: 100, zoom: 1, rotation: 0 });
    setFilters({ brightness: 100, contrast: 100, saturation: 100, blur: 0 });
    setShowGallery(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-gray-500">
              Recommended size: {recommendedSize.width}x{recommendedSize.height} ({recommendedSize.aspectRatio})
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGallery(!showGallery)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Gallery"
            >
              <Folder className="h-5 w-5" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Main Content */}
          <div className="flex-1 p-4">
            {!selectedFile ? (
              /* Upload Area */
              <div
                className={`border-2 border-dashed rounded-lg h-full flex flex-col items-center justify-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload your {uploadType} photo
                </h3>
                <p className="text-gray-500 mb-4 text-center">
                  Drag and drop an image here, or click to select
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            ) : (
              /* Image Editor */
              <div className="h-full flex flex-col">
                {/* Preview */}
                <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative">
                  {previewUrl && (
                    <div className="w-full h-full flex items-center justify-center">
                      <canvas
                        ref={canvasRef}
                        className="max-w-full max-h-full object-contain border"
                        style={{ 
                          width: `${recommendedSize.width}px`, 
                          height: `${recommendedSize.height}px`,
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="mt-4 space-y-4">
                  {/* Crop Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Crop X: {cropSettings.x}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={cropSettings.x}
                        onChange={(e) => setCropSettings(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Crop Y: {cropSettings.y}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={cropSettings.y}
                        onChange={(e) => setCropSettings(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Zoom and Rotation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zoom: {cropSettings.zoom}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={cropSettings.zoom}
                        onChange={(e) => setCropSettings(prev => ({ ...prev, zoom: parseFloat(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rotation: {cropSettings.rotation}°
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={cropSettings.rotation}
                        onChange={(e) => setCropSettings(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {selectedFile && (
            <div className="w-80 border-l p-4 overflow-y-auto">
              {showGallery ? (
                /* Gallery */
                <div>
                  <h3 className="font-medium mb-4">Recent Uploads</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {gallery.map((item) => (
                      <div key={item.id} className="relative group">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-75"
                          onClick={() => {
                            setPreviewUrl(item.url);
                            setSelectedFile({ name: item.name });
                          }}
                        />
                        <button
                          onClick={() => setGallery(prev => prev.filter(g => g.id !== item.id))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Filters */
                <div className="space-y-4">
                  <h3 className="font-medium">Filters & Adjustments</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brightness: {filters.brightness}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={filters.brightness}
                      onChange={(e) => setFilters(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contrast: {filters.contrast}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={filters.contrast}
                      onChange={(e) => setFilters(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Saturation: {filters.saturation}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={filters.saturation}
                      onChange={(e) => setFilters(prev => ({ ...prev, saturation: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blur: {filters.blur}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={filters.blur}
                      onChange={(e) => setFilters(prev => ({ ...prev, blur: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setFilters({ brightness: 100, contrast: 100, saturation: 100, blur: 0 })}
                        className="p-2 text-sm border rounded hover:bg-gray-50"
                      >
                        Reset Filters
                      </button>
                      <button
                        onClick={() => setCropSettings(prev => ({ ...prev, rotation: prev.rotation + 90 }))}
                        className="p-2 text-sm border rounded hover:bg-gray-50 flex items-center justify-center"
                      >
                        <RotateCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedFile && (
          <div className="border-t p-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              File: {selectedFile.name}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Upload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUploadModal;

