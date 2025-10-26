# 03. 지갑 연동 (Wallet Integration)

## 개요
사용자가 Phantom, Solflare 등의 Solana 지갑을 웹사이트에 연결하여 거래 및 자산 관리를 수행할 수 있도록 하는 시스템.

## 주요 기능
- **지갑 연결:** 주요 Solana 지갑(Phantom, Solflare, Ledger 등) 지원
- **트랜잭션 서명:** 사용자의 개인키로 거래에 서명
- **잔액 조회:** 연결된 지갑의 SOL 및 SPL 토큰 잔액 조회
- **세션 관리:** 지갑 연결/해제 및 세션 유지

## 기술 요구사항
- **라이브러리:** @solana/web3.js, wallet-adapter
- **프론트엔드:** React / Next.js
- **상태 관리:** Context API 또는 Redux

## 지원 지갑
- Phantom
- Solflare
- Ledger
- Magic Eden

## 보안 고려사항
- 사용자 개인키는 로컬에서만 처리
- 서버에 민감한 정보 저장 금지
- HTTPS 통신 필수

## 연관 피쳐
- 자금 입출금
- 포트폴리오 모니터링

## 개발 우선순위
**높음** - 초기 사용자 온보딩의 필수 요소
