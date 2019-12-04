# OS_Contiguous Allocation
Contiguous Allocation with Compaction & Coalescing

- 어떻게 Contiguous Allocation이 이루어지는지 매 요청마다 그림을 그림
- Chrome, Safari, IE에서 동작가능


### Compaction

> 흩어져있는 메모리 블록들을 한곳으로 모아서, 할당가능한 Free블록의 크기를 최대화. 


### Coalescing

> 인접한 Free블록들을 한 블록으로 묶어서 OS에서 더 큰 블록을 할당가능하게 만듬.


 
![Alt Text](https://github.com/khujay15/OS_Contiguous-Allocation/blob/master/ScreenShot.png).
