import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export type Meal = {
  breakfast: string;
  lunch: string[];
  dinner: string[];
};

export async function generateMenuPDF(weekMenu: Meal[], userName: string = 'User') {
  // Create a temporary container for the PDF content
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '-9999px';
  tempContainer.style.width = '800px';
  tempContainer.style.backgroundColor = '#ffffff';
  tempContainer.style.padding = '20px';
  tempContainer.style.fontFamily = 'Arial, sans-serif';
  
  // Add title
  const title = document.createElement('h1');
  title.textContent = `${userName}'s 7-Day Meal Plan`;
  title.style.fontSize = '24px';
  title.style.fontWeight = 'bold';
  title.style.textAlign = 'center';
  title.style.marginBottom = '30px';
  title.style.color = '#1f2937';
  tempContainer.appendChild(title);

  // Create table
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.fontSize = '12px';

  // Add header row
  const headerRow = document.createElement('tr');
  headerRow.style.backgroundColor = '#f3f4f6';
  
  const dayHeader = document.createElement('th');
  dayHeader.textContent = 'Day';
  dayHeader.style.padding = '12px 8px';
  dayHeader.style.border = '1px solid #d1d5db';
  dayHeader.style.textAlign = 'left';
  dayHeader.style.fontWeight = 'bold';
  dayHeader.style.backgroundColor = '#f9fafb';
  headerRow.appendChild(dayHeader);

  const breakfastHeader = document.createElement('th');
  breakfastHeader.textContent = 'Breakfast';
  breakfastHeader.style.padding = '12px 8px';
  breakfastHeader.style.border = '1px solid #d1d5db';
  breakfastHeader.style.textAlign = 'center';
  breakfastHeader.style.fontWeight = 'bold';
  breakfastHeader.style.backgroundColor = '#fef2f2';
  breakfastHeader.style.color = '#991b1b';
  headerRow.appendChild(breakfastHeader);

  const lunchHeader = document.createElement('th');
  lunchHeader.textContent = 'Lunch';
  lunchHeader.style.padding = '12px 8px';
  lunchHeader.style.border = '1px solid #d1d5db';
  lunchHeader.style.textAlign = 'center';
  lunchHeader.style.fontWeight = 'bold';
  lunchHeader.style.backgroundColor = '#fffbeb';
  lunchHeader.style.color = '#92400e';
  headerRow.appendChild(lunchHeader);

  const dinnerHeader = document.createElement('th');
  dinnerHeader.textContent = 'Dinner';
  dinnerHeader.style.padding = '12px 8px';
  dinnerHeader.style.border = '1px solid #d1d5db';
  dinnerHeader.style.textAlign = 'center';
  dinnerHeader.style.fontWeight = 'bold';
  dinnerHeader.style.backgroundColor = '#f3e8ff';
  dinnerHeader.style.color = '#6b21a8';
  headerRow.appendChild(dinnerHeader);

  table.appendChild(headerRow);

  // Add data rows
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  days.forEach((dayName, index) => {
    const row = document.createElement('tr');
    if (index % 2 === 0) {
      row.style.backgroundColor = '#f9fafb';
    }

    // Day column
    const dayCell = document.createElement('td');
    dayCell.textContent = dayName;
    dayCell.style.padding = '10px 8px';
    dayCell.style.border = '1px solid #d1d5db';
    dayCell.style.fontWeight = 'bold';
    dayCell.style.color = '#374151';
    row.appendChild(dayCell);

    // Breakfast column
    const breakfastCell = document.createElement('td');
    breakfastCell.textContent = weekMenu[index]?.breakfast || '-';
    breakfastCell.style.padding = '10px 8px';
    breakfastCell.style.border = '1px solid #d1d5db';
    breakfastCell.style.textAlign = 'center';
    breakfastCell.style.color = '#374151';
    row.appendChild(breakfastCell);

    // Lunch column
    const lunchCell = document.createElement('td');
    lunchCell.textContent = weekMenu[index]?.lunch?.join(', ') || '-';
    lunchCell.style.padding = '10px 8px';
    lunchCell.style.border = '1px solid #d1d5db';
    lunchCell.style.textAlign = 'center';
    lunchCell.style.color = '#374151';
    row.appendChild(lunchCell);

    // Dinner column
    const dinnerCell = document.createElement('td');
    dinnerCell.textContent = weekMenu[index]?.dinner?.join(', ') || '-';
    dinnerCell.style.padding = '10px 8px';
    dinnerCell.style.border = '1px solid #d1d5db';
    dinnerCell.style.textAlign = 'center';
    dinnerCell.style.color = '#374151';
    row.appendChild(dinnerCell);

    table.appendChild(row);
  });

  tempContainer.appendChild(table);

  // Add footer
  const footer = document.createElement('div');
  footer.style.marginTop = '30px';
  footer.style.textAlign = 'center';
  footer.style.fontSize = '10px';
  footer.style.color = '#6b7280';
  footer.textContent = `Generated on ${new Date().toLocaleDateString()} by Meal Planner`;
  tempContainer.appendChild(footer);

  // Add to DOM temporarily
  document.body.appendChild(tempContainer);

  try {
    // Generate canvas from HTML
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: tempContainer.scrollHeight
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download PDF
    const fileName = `${userName.replace(/\s+/g, '_')}_7Day_Meal_Plan_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

  } finally {
    // Clean up
    document.body.removeChild(tempContainer);
  }
}
