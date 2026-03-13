import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { StudyRow } from "../pages/dashboard/DashboardLaboratory";

interface UploadResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: StudyRow | null;
  onUpload: (file: File) => Promise<void>;
}

export const UploadResultModal = ({ isOpen, onClose, study, onUpload }: UploadResultModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !study) return null;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    // Validar tipo JSON y peso menor a 50MB
    if (!selectedFile.name.endsWith('.json') && selectedFile.type !== 'application/json') {
      alert("Solo se permiten archivos .json");
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      alert("El archivo no puede superar los 50MB");
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
      setFile(null);
      onClose();
    } catch (error) {
      console.error("Error al cargar el archivo", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-gray-900">Cargar resultados de estudio</h2>
        <p className="text-gray-500 mb-6">Estudio: <span className="font-medium text-gray-800">{study.studyCode}</span></p>

        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Verificación de datos del estudio</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <p className="text-gray-500">ID de paciente</p>
              <p className="font-medium text-gray-900">{study.patientCode}</p>
            </div>
            <div>
              <p className="text-gray-500">Nutricionista</p>
              <p className="font-medium text-gray-900">{study.assignedUser?.name || "Sin asignar"}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha del estudio</p>
              <p className="font-medium text-gray-900">{new Date(study.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-800 mb-2">Archivo de resultados (JSON)</p>
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json,application/json" 
              onChange={handleFileSelect}
            />
            
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">📄</span>
                <span className="text-blue-700 font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <div>
                <p className="text-blue-600 font-medium">Arrastre y suelte o seleccione el archivo</p>
                <p className="text-gray-500 text-sm mt-1">Solo archivos .json · máximo 50MB</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          Al confirmar, los resultados se vincularán permanentemente a la ficha del paciente creada por el nutricionista.
        </p>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            disabled={uploading}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {uploading ? "Cargando..." : "Cargar resultados"}
          </button>
        </div>
      </div>
    </div>
  );
};
