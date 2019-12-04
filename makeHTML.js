/**
 *
 * @param {*} AllocateBlock 할당블록 배열
 * @param {*} MemorySize 총 메모리 크기
 * @param {*} tagName 메모리 위에 적을 이름
 * @param {*} Info 메모리 옆에 적을 설명
 */
function Draw(AllocateBlock, MemorySize, tagName, Info) {
  var last = 0;
  var strBlock = "";

  for (var i in AllocateBlock) {
    // 공백이 있을 때 공백 추가
    if (AllocateBlock[i].start !== last)
      strBlock =
        strBlock +
        '<div style="display:flex;align-items: center;justify-content: center; height:' +
        String(((AllocateBlock[i].start - last) * 100) / MemorySize) +
        '%;background-color:white"><span>free<span></div>';
    // 공백이 없을 때

    var height =
      ((AllocateBlock[i].end - AllocateBlock[i].start) * 100) / MemorySize;

    strBlock =
      strBlock +
      '<div style="display:flex;align-items: center;justify-content: center;height:' +
      String(height - 0.5) +
      "%;background-color:" +
      String(AllocateBlock[i].color) +
      '; border: 1px solid black"><span>' +
      String(AllocateBlock[i].end - AllocateBlock[i].start) +
      "</span></div>";

    last = AllocateBlock[i].end;
  }

  var MemoryTable =
    "<div><p>" +
    tagName +
    "</p>" +
    '<div style="display: flex; flex-direction:row">' +
    '<div style="width:300px;height:360px;border: 1px solid black;margin-bottom:20px; margin-right:20px "> ' +
    strBlock +
    "</div>" +
    "<div>" +
    Info +
    "</div>" +
    "</div>";
  ("</div>");
  document.getElementById("AllocateTable").innerHTML =
    document.getElementById("AllocateTable").innerHTML + MemoryTable;
}
