import api from "@/lib/api"

export interface EvidenciaRequerimiento {
  id: number
  idRequerimiento: number
  nombreArchivo: string
  tipoArchivo: string
  rutaArchivo: string
  tamañoBytes: number
  descripcion?: string | null
  fechaCarga: string
}

export const evidenciasService = {
  listPorRequerimiento: async (idRequerimiento: number): Promise<EvidenciaRequerimiento[]> => {
    const response = await api.get<EvidenciaRequerimiento[]>(
      `/evidencias/requerimiento/${idRequerimiento}`
    )
    return response.data
  },

  getById: async (id: number): Promise<EvidenciaRequerimiento> => {
    const response = await api.get<EvidenciaRequerimiento>(`/evidencias/${id}`)
    return response.data
  },

  subirEvidencia: async (
    idRequerimiento: number,
    archivo: File,
    descripcion?: string
  ): Promise<EvidenciaRequerimiento> => {
    const formData = new FormData()
    formData.append("archivo", archivo)
    if (descripcion) {
      formData.append("descripcion", descripcion)
    }

    const response = await api.post<EvidenciaRequerimiento>(
      `/evidencias/${idRequerimiento}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/evidencias/${id}`)
  },

  descargarArchivo: async (id: number): Promise<Blob> => {
    const response = await api.get(`/evidencias/${id}/descargar`, {
      responseType: "blob",
    })
    return response.data
  },

  verArchivo: async (id: number): Promise<Blob> => {
    const response = await api.get(`/evidencias/${id}/ver`, {
      responseType: "blob",
    })
    return response.data
  },

  obtenerUrlPreview: (id: number): string => {
    return `${api.defaults.baseURL}/evidencias/${id}/ver`
  },
}
