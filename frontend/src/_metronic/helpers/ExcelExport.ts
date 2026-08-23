import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string = 'export', sheetName: string = 'Data') => {
  const worksheet = XLSX.utils.json_to_sheet(data);

  if (data.length > 0) {
    const keys = Object.keys(data[0]);

    for (const key in worksheet) {
      if (key.match(/^[A-Z]1$/)) { 
        if (!worksheet[key].s) worksheet[key].s = {};
        if (!worksheet[key].s.font) worksheet[key].s.font = {};
        worksheet[key].s.font.bold = true;
        worksheet[key].s.font.color = { rgb: "FF2E7D32" };
      }
    }

    const wscols = keys.map(key => {
      let maxLength = key.length;
      data.forEach(row => {
        const val = row[key] ? row[key].toString() : '';
        if (val.length > maxLength) {
          maxLength = val.length;
        }
      });
      return { wch: Math.min(Math.max(maxLength + 5, 18), 100) }; 
    });
    worksheet['!cols'] = wscols;
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToCsv = (data: any[], fileName: string = 'export') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};