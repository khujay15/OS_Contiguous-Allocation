var CreateButton = document.getElementById("startAllocate");
CreateButton.addEventListener("click", main);

function main(event) {
  document.getElementById("AllocateTable").innerHTML = "";
  // Block 구분을 위한 색깔 Hex값 총 16개. 원하는 만큼 넣어서 사용할 수 있음.
  var Palette = [
    "#ff0000",
    "#ff7f00",
    "#ffff00",
    "#00ff00",
    "#0000ff",
    "#4B0082",
    "#8b00ff",
    "#008080",
    "#808080",
    "#800000",
    "#FF7F50",
    "#FFA500",
    "#6B8E23",
    "#FF00FF",
    "#FF1493",
    "#8B4513"
  ];

  //사용자에게 입력받은 메모리의 크기와 할당요청순서. 할당요청순서는 String으로 한줄로 입력받음
  var numMemory = document.getElementById("numMemory").value;
  var strSequence = document.getElementById("strSequence").value.trim();

  var jobQueue = new Array();
  var arrSequence = strSequence.split(" ");
  if (arrSequence.length % 2 != 0) alert("잘못된 입력입니다.");

  var PaletteIdx = 0;

  for (var i = 0; i < arrSequence.length / 2; i++) {
    var requestId = arrSequence[2 * i];
    var requestBlock = arrSequence[2 * i + 1];
    //Allocation -> need color block
    if (requestBlock > 0) {
      jobQueue.push({
        requestId: requestId,
        requestBlock: Number(requestBlock),
        color: Palette[PaletteIdx]
      });
      PaletteIdx = PaletteIdx + 1;
    }
    //Free
    else
      jobQueue.push({
        requestId: requestId,
        requestBlock: Number(requestBlock)
      });
  }

  Allocate(Number(numMemory), jobQueue);
}
