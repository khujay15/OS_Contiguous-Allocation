//할당 블록의 총합 전역변수
var TotalAllocate = 0;

/**
 *
 * @param {*} targetBlockSize 이번에 할당하려는 블록의 크기
 * @param {*} freeBlock 남는 빈칸블록의 배열
 * @returns freeBlock 중에서 targetBlockSize 보다 큰 것들 중 가장 작은 것. 즉 가장 비슷하게 큰 빈칸의 index번호를 리턴
 */
function findSimilarBlock(targetBlockSize, freeBlock) {
  var tmp = Infinity;
  var idxToAlloc = -1;
  for (var i in freeBlock) {
    var size = freeBlock[i][1] - freeBlock[i][0];
    if (size >= targetBlockSize && size < tmp) {
      idxToAlloc = i;
      tmp = size;
    }
  }
  return idxToAlloc;
}

/**
 *
 * @param {*} MemorySize 총 메모리 사이즈
 * @param {*} jobQueue 사용자에게 입력받은 할당 순서
 * @description jobQueue에서 한번 작업할 때마다 메모리를 그림. Coalescing은 블록을 해제 후 빈칸들이 연속으로 인접했을 때 그림.
 *              Compaction은 남은 빈칸들의 총합보다 작지만 각각의 빈칸들보다 큰 블록이 할당요청했을 때, 실행 후 해당 블록을 할당함.
 */
function Allocate(MemorySize, jobQueue) {
  var freeBlock = new Array();
  var AllocateBlock = new Array();
  TotalAllocate = 0;

  freeBlock.push([0, MemorySize]); // [ blockStart, blockEnd ].

  for (var i in jobQueue) {
    if (jobQueue[i].requestBlock > 0) {
      var idx = findSimilarBlock(jobQueue[i].requestBlock, freeBlock);
      if (idx < 0) {
        if (
          compact(
            AllocateBlock,
            freeBlock,
            jobQueue[i].requestBlock,
            MemorySize
          )
        ) {
          Draw(
            AllocateBlock,
            MemorySize,
            '<span style="font-weight:bold">#Compaction</span>',
            "<p>Number of FreeBlock: " +
              String(freeBlock.length) +
              "</p><p>Total Free Block: " +
              String(MemorySize - TotalAllocate) +
              "</p>"
          );

          idx = 0;
        } else return;
      }
      var blockStart = freeBlock[idx][0];
      AllocateBlock.push({
        start: blockStart,
        end: blockStart + jobQueue[i].requestBlock,
        color: jobQueue[i].color,
        requestId: jobQueue[i].requestId
      });
      TotalAllocate = TotalAllocate + jobQueue[i].requestBlock;
      AllocateBlock.sort(function(a, b) {
        return a.start < b.start ? -1 : a.start > b.start ? 1 : 0;
      });
      //freeBlock에서 할당해야할 블록만큼 작아짐.
      freeBlock[idx][0] = blockStart + jobQueue[i].requestBlock;
      //딱 맞게 할당된 경우 삭제.
      if (freeBlock[idx][0] == freeBlock[idx][1]) freeBlock.splice(idx, 1);

      Draw(
        AllocateBlock,
        MemorySize,
        "Request #" + String(jobQueue[i].requestId),
        "<p>Allocate " +
          String(jobQueue[i].requestBlock) +
          " Block</p> <p>Total Free Block: " +
          String(MemorySize - TotalAllocate) +
          "</p>"
      );
    } else {
      if (AllocateBlock.length < 1)
        alert("에러! 메모리에 해제할 블록이 없습니다");
      //free allocate
      for (var k in AllocateBlock) {
        if (jobQueue[i].requestId == AllocateBlock[k].requestId) {
          //화면에 해제되는 과정을 보여주기 위해 색깔 바꿈
          AllocateBlock[k].color = "white";

          var SizeToFree = AllocateBlock[k].end - AllocateBlock[k].start;
          TotalAllocate = TotalAllocate - SizeToFree;

          freeBlock.push([AllocateBlock[k].start, AllocateBlock[k].end]);
          freeBlock.sort(function(a, b) {
            return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
          });
          Draw(
            AllocateBlock,
            MemorySize,
            "FREE Request #" + String(jobQueue[i].requestId),
            "<p>Free " +
              String(SizeToFree) +
              " Block</p><p>Number of FreeBlock: " +
              String(freeBlock.length) +
              "</p><p>Total Free Block: " +
              String(MemorySize - TotalAllocate) +
              "</p>"
          );
          //블록해제
          AllocateBlock = freeEmptyBlock(
            JSON.parse(JSON.stringify(AllocateBlock))
          );

          var beforeCoalescing = freeBlock.length;
          //FreeBlock 갱신
          freeBlock = coalescing(JSON.parse(JSON.stringify(freeBlock)));

          // 인접한 freeBlock 겹쳐져서 블록갯수가 줄어들면 출력
          if (freeBlock.length < beforeCoalescing)
            Draw(
              AllocateBlock,
              MemorySize,
              '<span style="font-weight:bold">#CoaleScing</span>',
              "<p>Number of FreeBlock: " +
                String(freeBlock.length) +
                "</p><p>Total Free Block: " +
                String(MemorySize - TotalAllocate) +
                "</p>"
            );

          // break loop if you find block to free
          break;
        }
      }
    }
  }
}

/**
 *
 * @param {*} AllocateBlock 할당블록 배열
 * @param {*} freeBlock  남는 빈칸 블록 배열
 * @param {*} targetBlockSize 이번에 할당할 블록의 크기
 * @param {*} MemorySize 총 메모리 크기
 * @return  compaction 실행 성공시 true;
 */
function compact(AllocateBlock, freeBlock, targetBlockSize, MemorySize) {
  //  각각의 freeBlock 크기 < targetBlockSize < freeBlock 총합
  var totalFree = 0;
  for (var i in freeBlock)
    totalFree = totalFree + (freeBlock[i][1] - freeBlock[i][0]);

  if (totalFree < targetBlockSize) {
    alert("할당할 block 사이즈가 너무 큽니다");
    return false;
  }
  //0부터 차례로 위로 정렬
  var StartPointer = 0;

  var numBlock = AllocateBlock.length;

  // 하나씩 빼서 시작위치와 끝위치를 조정하고 다시 넣음
  for (var i = 0; i < numBlock; i++) {
    var tmpBlock = AllocateBlock.shift();
    var blockSize = tmpBlock.end - tmpBlock.start;
    AllocateBlock.push({
      start: StartPointer,
      end: StartPointer + blockSize,
      color: tmpBlock.color,
      requestId: tmpBlock.requestId
    });
    StartPointer = StartPointer + blockSize;
  }

  var numFreeBlock = freeBlock.length;
  for (var i = 0; i < numFreeBlock; i++) freeBlock.pop();
  // 하나로 합쳐진 freeBlock
  freeBlock.push([StartPointer, MemorySize]);

  return true;
}
/**
 *
 * @param {*} freeBlock 남는 빈칸배열
 * @description   빈칸 배열들의 원소를 순환하면서, 서로 인접한 것들은 묶어서 처리. 인접한 빈칸은 재귀를 통해서 연결
 */
function coalescing(freeBlock) {
  //freeblock -> sorted
  if (freeBlock.length < 2) return freeBlock;

  var find = false;
  var newFreeBlock = new Array();
  var i;
  for (i = 0; i < freeBlock.length; i++) {
    var start = freeBlock[i][0];
    var end = freeBlock[i][1];

    for (var k = i + 1; k < freeBlock.length; k++) {
      if (end == freeBlock[k][0]) {
        end = freeBlock[k][1];
        i = i + 1;
        find = true;
      }
    }
    newFreeBlock.push([start, end]);
  }
  return find ? coalescing(newFreeBlock) : newFreeBlock;
}

/**
 *
 * @param {*} AllocateBlock 할당된 블록 배열
 * @description Coalescing을 시각적으로 보여주기 위해 Free요청 시 색만 white로 바꿨던 배열에서 진짜로 할당을 해제
 */
function freeEmptyBlock(AllocateBlock) {
  var newAllocateBlock = new Array();

  for (var i in AllocateBlock) {
    //블록 중에 색이 white인 것들은 해제된 블록이므로 추가하지 않는다.
    if (AllocateBlock[i].color == "white") continue;
    newAllocateBlock.push(AllocateBlock[i]);
  }

  return newAllocateBlock;
}
