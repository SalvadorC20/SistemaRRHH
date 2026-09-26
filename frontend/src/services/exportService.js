import jsPDF from 'jspdf';

// Función auxiliar para manejar colores de forma segura
const setSafeColor = (doc, color) => {
  try {
    if (Array.isArray(color)) {
      doc.setTextColor(color[0], color[1], color[2]);
    } else if (typeof color === 'string') {
      doc.setTextColor(color);
    } else {
      doc.setTextColor(0, 0, 0); // Negro por defecto
    }
  } catch (error) {
    console.warn('Error setting color, using default black:', error);
    doc.setTextColor(0, 0, 0);
  }
};

// Función auxiliar para manejar fill colors de forma segura
const setSafeFillColor = (doc, color) => {
  try {
    if (Array.isArray(color)) {
      doc.setFillColor(color[0], color[1], color[2]);
    } else if (typeof color === 'string') {
      doc.setFillColor(color);
    } else {
      doc.setFillColor(255, 255, 255); // Blanco por defecto
    }
  } catch (error) {
    console.warn('Error setting fill color, using default white:', error);
    doc.setFillColor(255, 255, 255);
  }
};

// Función para agregar encabezado profesional SIN ICONOS
const addHeader = (doc, pageWidth, title, subtitle, color) => {
  setSafeFillColor(doc, color);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Título principal (centrado)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  setSafeColor(doc, [255, 255, 255]);
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  // Subtítulo
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, pageWidth / 2, 28, { align: 'center' });

  // Información de la empresa
  doc.setFontSize(7);
  doc.text('Sistema de Gestión de Recursos Humanos', 15, 35);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - 15, 35, { align: 'right' });
};

// Función para agregar pie de página
const addFooter = (doc, pageWidth) => {
  const footerY = doc.internal.pageSize.height - 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, footerY, pageWidth - 15, footerY);
  
  doc.setFontSize(7);
  setSafeColor(doc, [100, 100, 100]);
  doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageWidth / 2, footerY + 5, { align: 'center' });
  doc.text('Documento Confidencial - Uso Interno', pageWidth - 15, footerY + 5, { align: 'right' });
};

// Función para agregar cuadro de información CORREGIDA (sin caracteres especiales)
const addInfoBox = (doc, pageWidth, yPosition, title, items) => {
  setSafeFillColor(doc, [248, 249, 250]);
  doc.rect(15, yPosition, pageWidth - 30, 25, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, yPosition, pageWidth - 30, 25, 'S');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setSafeColor(doc, [33, 37, 41]);
  doc.text(title, 20, yPosition + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  items.forEach((item, index) => {
    // Usar texto simple sin caracteres especiales problemáticos
    doc.text(item.text, item.x, yPosition + 16 + (index * 6));
  });
};

export const exportService = {
  // Exportar reporte de nómina a PDF
  exportNominaToPDF: (reporte, metadata, filtros) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let yPosition = 50;

      // ===== ENCABEZADO PROFESIONAL SIN ICONO =====
      addHeader(doc, pageWidth, 
        'REPORTE DE NÓMINA', 
        'Resumen detallado de liquidaciones salariales',
        [41, 128, 185]
      );

      // ===== INFORMACIÓN DEL REPORTE =====
      const infoItems = [
        { text: `Periodo: ${metadata.periodo}`, x: 20 },
        { text: `Departamento: ${metadata.departamento}`, x: 20 },
        { text: `Total Nomina: C$ ${metadata.total_nomina?.toFixed(2) || '0.00'}`, x: 100 },
        { text: `Registros: ${metadata.total_registros}`, x: 100 },
        { text: `Estado: ${filtros.estado || 'Todos'}`, x: 160 }
      ];
      
      addInfoBox(doc, pageWidth, yPosition, 'INFORMACION DEL REPORTE', infoItems);

      // ===== TABLA DE DATOS =====
      yPosition += 35;
      
      // Encabezado de tabla
      setSafeFillColor(doc, [52, 58, 64]);
      doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
      setSafeColor(doc, [255, 255, 255]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      
      const columnWidths = [35, 22, 22, 20, 20, 20, 20, 18, 18];
      const columns = ['Empleado', 'Depto', 'Puesto', 'Base', 'Bruto', 'Deduc', 'Neto', 'Estado', 'Fecha'];
      let xPosition = 17;
      
      columns.forEach((col, index) => {
        doc.text(col, xPosition, yPosition + 6);
        xPosition += columnWidths[index];
      });

      // Datos de la tabla
      yPosition += 8;
      setSafeColor(doc, [33, 37, 41]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);

      reporte.forEach((item, index) => {
        // Manejo de paginación
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
          addHeader(doc, pageWidth, 'REPORTE DE NOMINA (Cont.)', '', [41, 128, 185]);
          yPosition += 35;
          
          // Repetir encabezado de tabla
          setSafeFillColor(doc, [52, 58, 64]);
          doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
          setSafeColor(doc, [255, 255, 255]);
          doc.setFont('helvetica', 'bold');
          xPosition = 17;
          columns.forEach((col, idx) => {
            doc.text(col, xPosition, yPosition + 6);
            xPosition += columnWidths[idx];
          });
          yPosition += 8;
          setSafeColor(doc, [33, 37, 41]);
          doc.setFont('helvetica', 'normal');
        }

        // Fondo alternado para filas
        if (index % 2 === 0) {
          setSafeFillColor(doc, [248, 249, 250]);
          doc.rect(15, yPosition - 4, pageWidth - 30, 6, 'F');
        }

        xPosition = 17;
        
        // Empleado
        const nombreCompleto = `${item.nombre || ''} ${item.apellido || ''}`.trim();
        doc.text(nombreCompleto.substring(0, 20), xPosition, yPosition);
        xPosition += columnWidths[0];
        
        // Departamento
        doc.text((item.departamento || '-').substring(0, 10), xPosition, yPosition);
        xPosition += columnWidths[1];
        
        // Puesto
        doc.text((item.puesto || '-').substring(0, 10), xPosition, yPosition);
        xPosition += columnWidths[2];
        
        // Salario Base
        doc.text(`C$${parseFloat(item.salario_base || 0).toFixed(0)}`, xPosition, yPosition);
        xPosition += columnWidths[3];
        
        // Salario Bruto
        doc.text(`C$${parseFloat(item.salario_bruto || 0).toFixed(0)}`, xPosition, yPosition);
        xPosition += columnWidths[4];
        
        // Deducciones
        const totalDeducciones = item.deducciones ? 
          (() => {
            try {
              const deducciones = typeof item.deducciones === 'string' ? 
                JSON.parse(item.deducciones) : item.deducciones;
              if (typeof deducciones === 'object') {
                return Object.values(deducciones).reduce((sum, ded) => {
                  const valor = parseFloat(ded) || 0;
                  return sum + valor;
                }, 0);
              }
              return 0;
            } catch (error) {
              return 0;
            }
          })() : 0;
        doc.text(`C$${totalDeducciones.toFixed(0)}`, xPosition, yPosition);
        xPosition += columnWidths[5];
        
        // Salario Neto
        doc.setFont('helvetica', 'bold');
        doc.text(`C$${parseFloat(item.salario_neto || 0).toFixed(0)}`, xPosition, yPosition);
        doc.setFont('helvetica', 'normal');
        xPosition += columnWidths[6];
        
        // Estado
        const estado = item.estado_nomina || 'N/A';
        const estadoColor = 
          estado === 'PAGADO' ? [46, 125, 50] :
          estado === 'PENDIENTE' ? [237, 108, 2] :
          estado === 'CANCELADO' ? [198, 40, 40] :
          [108, 117, 125];
        
        setSafeColor(doc, estadoColor);
        doc.text(estado.substring(0, 8), xPosition, yPosition);
        setSafeColor(doc, [33, 37, 41]);
        xPosition += columnWidths[7];
        
        // Fecha
        const fecha = item.fecha_pago ? 
          new Date(item.fecha_pago).toLocaleDateString('es-ES') : 'N/A';
        doc.text(fecha.substring(0, 8), xPosition, yPosition);

        yPosition += 5;
      });

      // ===== RESUMEN FINAL =====
      if (yPosition < 220) {
        yPosition += 10;
        const totalBruto = reporte.reduce((sum, item) => sum + parseFloat(item.salario_bruto || 0), 0);
        const totalNeto = reporte.reduce((sum, item) => sum + parseFloat(item.salario_neto || 0), 0);
        const totalDeducciones = totalBruto - totalNeto;

        setSafeFillColor(doc, [52, 58, 64]);
        doc.rect(15, yPosition, pageWidth - 30, 20, 'F');
        
        doc.setFontSize(9);
        setSafeColor(doc, [255, 255, 255]);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMEN FINAL', 20, yPosition + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Total Bruto: C$ ${totalBruto.toFixed(2)}`, 20, yPosition + 15);
        doc.text(`Total Deducciones: C$ ${totalDeducciones.toFixed(2)}`, 100, yPosition + 15);
        doc.text(`Total Neto: C$ ${totalNeto.toFixed(2)}`, 160, yPosition + 15);
      }

      // ===== PIE DE PÁGINA =====
      addFooter(doc, pageWidth);

      // Guardar PDF
      doc.save(`reporte-nomina-${metadata.periodo}.pdf`);

    } catch (error) {
      console.error('Error generando PDF de nómina:', error);
      alert('Error al generar el PDF: ' + error.message);
    }
  },

  // Exportar reporte de desempeño a PDF
  exportDesempenoToPDF: (reporte, metadata, filtros) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let yPosition = 50;

      // ===== ENCABEZADO PROFESIONAL SIN ICONO =====
      addHeader(doc, pageWidth, 
        'EVALUACION DE DESEMPEÑO', 
        'Reporte de Evaluacion del Personal',
        [39, 174, 96]
      );

      // ===== INFORMACIÓN DEL REPORTE =====
      const infoItems = [
        { text: `Periodo: ${metadata.periodo}`, x: 20 },
        { text: `Departamento: ${metadata.departamento}`, x: 20 },
        { text: `Promedio: ${metadata.promedio_general?.toFixed(2) || '0.00'}/10`, x: 100 },
        { text: `Evaluados: ${metadata.total_registros}`, x: 100 },
        { text: `Fecha: ${new Date().toLocaleDateString('es-ES')}`, x: 160 }
      ];
      
      addInfoBox(doc, pageWidth, yPosition, 'INFORMACION DE LA EVALUACION', infoItems);

      // ===== TABLA DE DATOS =====
      yPosition += 35;
      
      // Encabezado de tabla
      setSafeFillColor(doc, [52, 58, 64]);
      doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
      setSafeColor(doc, [255, 255, 255]);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      
      const columnWidths = [30, 20, 20, 18, 25, 10, 10, 10, 10, 12, 25];
      const columns = ['Empleado', 'Depto', 'Puesto', 'Periodo', 'Evaluador', 'Pun', 'Cal', 'Col', 'Ini', 'Total', 'Comentarios'];
      let xPosition = 17;
      
      columns.forEach((col, index) => {
        doc.text(col, xPosition, yPosition + 6);
        xPosition += columnWidths[index];
      });

      // Datos de la tabla
      yPosition += 8;
      setSafeColor(doc, [33, 37, 41]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);

      reporte.forEach((item, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
          addHeader(doc, pageWidth, 'EVALUACION DE DESEMPEÑO (Cont.)', '', [39, 174, 96]);
          yPosition += 35;
          
          // Repetir encabezado
          setSafeFillColor(doc, [52, 58, 64]);
          doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
          setSafeColor(doc, [255, 255, 255]);
          doc.setFont('helvetica', 'bold');
          xPosition = 17;
          columns.forEach((col, idx) => {
            doc.text(col, xPosition, yPosition + 6);
            xPosition += columnWidths[idx];
          });
          yPosition += 8;
          setSafeColor(doc, [33, 37, 41]);
          doc.setFont('helvetica', 'normal');
        }

        // Fondo alternado para filas
        if (index % 2 === 0) {
          setSafeFillColor(doc, [248, 249, 250]);
          doc.rect(15, yPosition - 4, pageWidth - 30, 5, 'F');
        }

        xPosition = 17;
        
        // Empleado
        const nombreCompleto = `${item.nombre || ''} ${item.apellido || ''}`.trim();
        doc.text(nombreCompleto.substring(0, 12), xPosition, yPosition);
        xPosition += columnWidths[0];
        
        // Departamento
        doc.text((item.departamento || '-').substring(0, 8), xPosition, yPosition);
        xPosition += columnWidths[1];
        
        // Puesto
        doc.text((item.puesto || '-').substring(0, 8), xPosition, yPosition);
        xPosition += columnWidths[2];
        
        // Período
        doc.text((item.periodo_evaluacion || '-').substring(0, 6), xPosition, yPosition);
        xPosition += columnWidths[3];
        
        // Evaluador
        const evaluador = item.evaluador_nombre ? 
          `${item.evaluador_nombre} ${item.evaluador_apellido}`.substring(0, 10) : 'N/A';
        doc.text(evaluador, xPosition, yPosition);
        xPosition += columnWidths[4];
        
        // Puntualidad
        const puntualidad = parseFloat(item.puntualidad) || 0;
        doc.text(puntualidad.toFixed(1), xPosition, yPosition);
        xPosition += columnWidths[5];
        
        // Calidad
        const calidad = parseFloat(item.calidad_trabajo) || 0;
        doc.text(calidad.toFixed(1), xPosition, yPosition);
        xPosition += columnWidths[6];
        
        // Colaboración
        const colaboracion = parseFloat(item.colaboracion) || 0;
        doc.text(colaboracion.toFixed(1), xPosition, yPosition);
        xPosition += columnWidths[7];
        
        // Iniciativa
        const iniciativa = parseFloat(item.iniciativa) || 0;
        doc.text(iniciativa.toFixed(1), xPosition, yPosition);
        xPosition += columnWidths[8];
        
        // Total
        const total = parseFloat(item.puntuacion_total) || 0;
        doc.setFont('helvetica', 'bold');
        const totalColor = 
          total >= 9 ? [46, 125, 50] :
          total >= 7 ? [237, 108, 2] :
          [198, 40, 40];
        
        setSafeColor(doc, totalColor);
        doc.text(total.toFixed(1), xPosition, yPosition);
        setSafeColor(doc, [33, 37, 41]);
        doc.setFont('helvetica', 'normal');
        xPosition += columnWidths[9];
        
        // Comentarios
        const comentarios = (item.comentarios || 'Sin comentarios').substring(0, 20);
        doc.text(comentarios, xPosition, yPosition);

        yPosition += 4.5;
      });

      // ===== RESUMEN ESTADÍSTICO =====
      if (yPosition < 230) {
        yPosition += 8;
        const promedios = {
          puntualidad: reporte.reduce((sum, item) => sum + parseFloat(item.puntualidad || 0), 0) / reporte.length,
          calidad: reporte.reduce((sum, item) => sum + parseFloat(item.calidad_trabajo || 0), 0) / reporte.length,
          colaboracion: reporte.reduce((sum, item) => sum + parseFloat(item.colaboracion || 0), 0) / reporte.length,
          iniciativa: reporte.reduce((sum, item) => sum + parseFloat(item.iniciativa || 0), 0) / reporte.length
        };

        setSafeFillColor(doc, [39, 174, 96]);
        doc.rect(15, yPosition, pageWidth - 30, 15, 'F');
        
        doc.setFontSize(8);
        setSafeColor(doc, [255, 255, 255]);
        doc.setFont('helvetica', 'bold');
        doc.text('PROMEDIOS POR CATEGORIA', 20, yPosition + 6);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(`Puntualidad: ${promedios.puntualidad.toFixed(2)}`, 20, yPosition + 12);
        doc.text(`Calidad: ${promedios.calidad.toFixed(2)}`, 70, yPosition + 12);
        doc.text(`Colaboracion: ${promedios.colaboracion.toFixed(2)}`, 120, yPosition + 12);
        doc.text(`Iniciativa: ${promedios.iniciativa.toFixed(2)}`, 170, yPosition + 12);
      }

      // ===== PIE DE PÁGINA =====
      addFooter(doc, pageWidth);

      // Guardar PDF
      doc.save(`evaluacion-desempeno-${metadata.periodo}.pdf`);

    } catch (error) {
      console.error('Error generando PDF de desempeño:', error);
      alert('Error al generar el PDF: ' + error.message);
    }
  },

  // Exportar reporte de asistencia a PDF
  exportAsistenciaToPDF: (reporte, metadata, filtros) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let yPosition = 50;

      // ===== ENCABEZADO PROFESIONAL SIN ICONO =====
      addHeader(doc, pageWidth, 
        'CONTROL DE ASISTENCIA', 
        'Registro y Control de Presencia Laboral',
        [230, 126, 34]
      );

      // ===== INFORMACIÓN DEL REPORTE =====
      const infoItems = [
        { text: `Periodo: ${metadata.fecha_inicio} a ${metadata.fecha_fin}`, x: 20 },
        { text: `Departamento: ${metadata.departamento}`, x: 20 },
        { text: `Total Empleados: ${metadata.total_registros}`, x: 100 },
        { text: `Generado: ${new Date().toLocaleDateString('es-ES')}`, x: 100 }
      ];
      
      addInfoBox(doc, pageWidth, yPosition, 'INFORMACION DEL PERIODO', infoItems);

      // ===== TABLA DE DATOS =====
      yPosition += 35;
      
      // Encabezado de tabla
      setSafeFillColor(doc, [52, 58, 64]);
      doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
      setSafeColor(doc, [255, 255, 255]);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      
      const columnWidths = [32, 18, 18, 15, 15, 15, 15, 20, 15];
      const columns = ['Empleado', 'Depto', 'Puesto', 'D.Reg', 'D.Norm', 'D.Just', 'Inasist', 'Prom.Horas', '% Asist'];
      let xPosition = 17;
      
      columns.forEach((col, index) => {
        doc.text(col, xPosition, yPosition + 6);
        xPosition += columnWidths[index];
      });

      // Datos de la tabla
      yPosition += 8;
      setSafeColor(doc, [33, 37, 41]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);

      reporte.forEach((item, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
          addHeader(doc, pageWidth, 'CONTROL DE ASISTENCIA (Cont.)', '', [230, 126, 34]);
          yPosition += 35;
          
          // Repetir encabezado
          setSafeFillColor(doc, [52, 58, 64]);
          doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
          setSafeColor(doc, [255, 255, 255]);
          doc.setFont('helvetica', 'bold');
          xPosition = 17;
          columns.forEach((col, idx) => {
            doc.text(col, xPosition, yPosition + 6);
            xPosition += columnWidths[idx];
          });
          yPosition += 8;
          setSafeColor(doc, [33, 37, 41]);
          doc.setFont('helvetica', 'normal');
        }

        // Fondo alternado para filas
        if (index % 2 === 0) {
          setSafeFillColor(doc, [248, 249, 250]);
          doc.rect(15, yPosition - 4, pageWidth - 30, 5, 'F');
        }

        const totalDias = Number(item.dias_registrados) || 0;
        const diasAsistidos = (Number(item.dias_normales) || 0) + (Number(item.dias_justificados) || 0);
        const porcentajeAsistencia = totalDias > 0 ? (diasAsistidos / totalDias) * 100 : 0;

        xPosition = 17;
        
        // Empleado
        const nombreCompleto = `${item.nombre || ''} ${item.apellido || ''}`.trim();
        doc.text(nombreCompleto.substring(0, 14), xPosition, yPosition);
        xPosition += columnWidths[0];
        
        // Departamento
        doc.text((item.departamento || '-').substring(0, 8), xPosition, yPosition);
        xPosition += columnWidths[1];
        
        // Puesto
        doc.text((item.puesto || '-').substring(0, 8), xPosition, yPosition);
        xPosition += columnWidths[2];
        
        // Días Registrados
        doc.text((item.dias_registrados || 0).toString(), xPosition, yPosition);
        xPosition += columnWidths[3];
        
        // Días Normales (verde)
        setSafeColor(doc, [46, 125, 50]);
        doc.text((item.dias_normales || 0).toString(), xPosition, yPosition);
        setSafeColor(doc, [33, 37, 41]);
        xPosition += columnWidths[4];
        
        // Días Justificados (naranja)
        setSafeColor(doc, [237, 108, 2]);
        doc.text((item.dias_justificados || 0).toString(), xPosition, yPosition);
        setSafeColor(doc, [33, 37, 41]);
        xPosition += columnWidths[5];
        
        // Inasistencias (rojo)
        setSafeColor(doc, [198, 40, 40]);
        doc.text((item.inasistencias || 0).toString(), xPosition, yPosition);
        setSafeColor(doc, [33, 37, 41]);
        xPosition += columnWidths[6];
        
        // Promedio Horas
        const promHoras = item.promedio_horas_diarias ? 
          parseFloat(item.promedio_horas_diarias).toFixed(1) : 'N/A';
        doc.text(promHoras + 'h', xPosition, yPosition);
        xPosition += columnWidths[7];
        
        // % Asistencia
        doc.setFont('helvetica', 'bold');
        const asistenciaColor = 
          porcentajeAsistencia >= 95 ? [46, 125, 50] :
          porcentajeAsistencia >= 85 ? [237, 108, 2] :
          [198, 40, 40];
        
        setSafeColor(doc, asistenciaColor);
        doc.text(porcentajeAsistencia.toFixed(1) + '%', xPosition, yPosition);
        setSafeColor(doc, [33, 37, 41]);
        doc.setFont('helvetica', 'normal');

        yPosition += 4.5;
      });

      // ===== RESUMEN ESTADÍSTICO =====
      const totalDiasNormales = reporte.reduce((sum, item) => sum + (Number(item.dias_normales) || 0), 0);
      const totalDiasJustificados = reporte.reduce((sum, item) => sum + (Number(item.dias_justificados) || 0), 0);
      const totalInasistencias = reporte.reduce((sum, item) => sum + (Number(item.inasistencias) || 0), 0);
      const totalDias = totalDiasNormales + totalDiasJustificados + totalInasistencias;
      const porcentajeAsistenciaGeneral = totalDias > 0 ? 
        ((totalDiasNormales + totalDiasJustificados) / totalDias) * 100 : 0;

      yPosition += 8;
      setSafeFillColor(doc, [230, 126, 34]);
      doc.rect(15, yPosition, pageWidth - 30, 20, 'F');
      
      doc.setFontSize(9);
      setSafeColor(doc, [255, 255, 255]);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN ESTADISTICO GENERAL', 20, yPosition + 8);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Tasa de Asistencia General: ${porcentajeAsistenciaGeneral.toFixed(1)}%`, 20, yPosition + 15);
      doc.text(`Total Dias Normales: ${totalDiasNormales}`, 100, yPosition + 15);
      doc.text(`Total Inasistencias: ${totalInasistencias}`, 160, yPosition + 15);

      // ===== PIE DE PÁGINA =====
      addFooter(doc, pageWidth);

      // Guardar PDF
      const nombreArchivo = `control-asistencia-${metadata.fecha_inicio}-${metadata.fecha_fin}.pdf`;
      doc.save(nombreArchivo);

    } catch (error) {
      console.error('Error generando PDF de asistencia:', error);
      alert('Error al generar el PDF: ' + error.message);
    }
  }
};