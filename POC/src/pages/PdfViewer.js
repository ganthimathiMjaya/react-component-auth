import React, { useRef } from 'react';
import { Button } from 'devextreme-react/button';
import 'devextreme/dist/css/dx.light.css';
import './PdfViewer.css'; // Styles extracted from your original HTML

const PdfViewer = () => {
  const iframeRef = useRef();

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = 'sample.pdf';
    link.download = 'sample.pdf';
    link.click();
  };

  const printPDF = () => {
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    printFrame.src = 'sample.pdf';
    document.body.appendChild(printFrame);
    printFrame.onload = () => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
    };
  };

  return (
    <div>

      {/* PDF Viewer */}
      <div className="viewer-wrapper">
        <iframe
          className="pdf-viewer"
          src="sample.pdf"
          ref={iframeRef}
          title="PDF Viewer"
        ></iframe>
      </div>

      {/* Button Section */}
      <div className="button-section">
        <Button text="Download" onClick={downloadPDF} />
        <Button text="Print" onClick={printPDF} />
        <Button text="Next Page" disabled />
      </div>
    </div>
  );
};

export default PdfViewer;
