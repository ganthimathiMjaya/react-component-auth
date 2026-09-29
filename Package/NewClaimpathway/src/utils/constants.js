export let flowData = {
    nodes: [
      {
        id: "1",
        type: "input",
        data: { label: "Appealed" },
        position: { x: 300, y: 0 },
        cp_status: "Completed",
      },
      {
        id: "2",
        data: { label: "Call the payer and check the Appeal status" },
        position: { x: 300, y: 100 },
        cp_status: "Completed",
      },
      {
        id: "3",
        data: { label: "Appeal Status - Still in Process" },
        position: { x: 150, y: 200 },
        cp_status: "Completed",
      },
      {
        id: "4",
        data: {
          label:
            "Check the normal processing time and get the reason for the delay",
        },
        position: { x: 150, y: 300 },
        cp_status: "Completed",
      },
      {
        id: "5",
        data: { label: "Appeal Status - Appeal not received" },
        position: { x: 450, y: 200 },
        cp_status: "Completed",
      },
      {
        id: "6",
        data: { label: "Check AFL and appeal address" },
        position: { x: 450, y: 300 },
        cp_status: "New",
      },
      {
        id: "7",
        data: {
          label:
            "AFL not Exceeded - Appeal with Medical records/Supporting documents to correct address",
        },
        position: { x: 450, y: 400 },
        cp_status: "New",
      },
      {
        id: "8",
        data: { label: "AFL Exceeded - follow the SOP" },
        position: { x: 550, y: 400 },
        cp_status: "Completed",
      },
      {
        id: "11",
        data: { label: "Appeal Status - Appeal upheld" },
        position: { x: 300, y: 300 },
        cp_status: "Current",
        options: [
          {
            fieldName: "Name",
            dataType: "varchar",
            isMandatory: true,
          },
          {
            fieldName: "Age",
            dataType: "Number",
            isMandatory: false,
          },
          {
            fieldName: "Country",
            dataType: "varchar",
            isMandatory: false,
          },
        ],
        isFormSubmitted: false
      },
      {
        id: "12",
        data: {
          label:
            "2nd level AFL not Exceeded - Follow the SOP/Send 2nd level appeal with Medical records/Supporting documents",
        },
        position: { x: 250, y: 400 },
        cp_status: "New",
        isFormSubmitted: false,
      },
      {
        id: "13",
        data: {
          label: "2nd level AFL Exceeded - Follow the SOP/Send it to client",
        },
        position: { x: 250, y: 500 },
        cp_status: "New",
        options: [
          {
            fieldName: "Payer Name",
            dataType: "varchar",
            isMandatory: true,
          },
          {
            fieldName: "Amount",
            dataType: "float",
            isMandatory: true,
          },
          {
            fieldName: "Phone",
            dataType: "Number",
            isMandatory: false,
          },
        ],
        isFormSubmitted: false
      },
      {
        id: "14",
        data: { label: "Appeal Status - Approved to pay" },
        position: { x: 300, y: 500 },
        cp_status: "New",
      },
      {
        id: "15",
        data: { label: "Get the payment details and follow payments pathway" },
        position: { x: 300, y: 600 },
        cp_status: "New",
      },
      {
        id: "16",
        data: { label: "Appeal Status - Other denial" },
        position: { x: 450, y: 500 },
        cp_status: "New",
      },
      {
        id: "17",
        data: { label: "Follow the respective denial pathway" },
        position: { x: 450, y: 600 },
        cp_status: "New",
      },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3" },
      { id: "e2-5", source: "2", target: "5" },
      { id: "e3-4", source: "3", target: "4" },
      { id: "e5-6", source: "5", target: "6" },
      { id: "e6-7", source: "6", target: "7" },
      { id: "e6-8", source: "6", target: "8" },
      { id: "e2-11", source: "2", target: "11" },
      { id: "e11-12", source: "11", target: "12" },
      { id: "e11-13", source: "11", target: "13" },
      { id: "e2-14", source: "2", target: "14" },
      { id: "e14-15", source: "14", target: "15" },
      { id: "e2-16", source: "2", target: "16" },
      { id: "e16-17", source: "16", target: "17" },
    ],
  };