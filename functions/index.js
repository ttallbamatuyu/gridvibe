const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// 토스페이먼츠 시크릿 키 (Firebase Config 환경 변수 또는 직접 하드코딩)
// TODO: 배포 시에는 반드시 보안 처리가 된 환경변수로 사용해야 합니다.
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || "test_sk_Z1aOwX7K8m050Nn2bARx8yQxzvNP"; // 테스트용 임시 키 (추후 교체 필요)

/**
 * 프론트엔드에서 결제 승인 요청을 받아 토스 서버에 최종 승인(Verify)을 요청하고
 * 성공하면 해당 유저의 Firestore 문서에 isPro: true 를 업데이트합니다.
 */
exports.verifyTossPayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { paymentKey, orderId, amount, uid } = req.body;

    if (!paymentKey || !orderId || !amount || !uid) {
      return res.status(400).json({ error: '필수 파라미터가 누락되었습니다.' });
    }

    try {
      // 1. 토스페이먼츠 최종 승인 API 호출
      const encodedKey = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');
      const response = await axios.post(
        'https://api.tosspayments.com/v1/payments/confirm',
        { paymentKey, orderId, amount },
        {
          headers: {
            Authorization: `Basic ${encodedKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 2. 승인 성공 시, Firebase Firestore 유저 상태 업데이트
      if (response.status === 200) {
        const userRef = db.collection('users').doc(uid);
        await userRef.set(
          {
            config: { isPro: true },
            paymentInfo: {
              paymentKey,
              orderId,
              amount,
              approvedAt: admin.firestore.FieldValue.serverTimestamp()
            }
          },
          { merge: true }
        );

        return res.status(200).json({ success: true, message: '결제가 성공적으로 승인되었습니다.' });
      } else {
        return res.status(400).json({ success: false, error: '결제 승인 실패' });
      }
    } catch (error) {
      console.error('Payment verification failed:', error.response ? error.response.data : error.message);
      return res.status(500).json({ success: false, error: '서버 에러가 발생했습니다.' });
    }
  });
});
