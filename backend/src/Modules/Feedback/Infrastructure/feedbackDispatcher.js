/**
 * US-10: atsiliepimo perdavimo taškas į DI paslaugų sluoksnį (AC10.4).
 *
 * Atsiliepimo tekstas duomenų bazėje nesaugomas – jis čia perduodamas kaip JSON objektas:
 *   { reservation_id, pet_id, user_id, content }
 *
 * TODO (AC10.4, DI dalį darantis komandos narys): čia iškviesti DI paslaugų sluoksnį,
 * kuris iš `content` išskiria stebėjimus apie gyvūno elgesį ir papildo gyvūno profilį
 * (pet_id). Kol kas funkcija nieko nedaro.
 *
 * Jei funkcija meta klaidą, feedbackService grąžina `feedback_received` į FALSE,
 * todėl savanoris gali pateikti atsiliepimą dar kartą ir tekstas nedingsta.
 * Atsiliepimo teksto nerašyti į žurnalą (console.log), nes jis nesaugomas sąmoningai.
 */
const dispatchFeedback = async (_payload) => {};

module.exports = { dispatchFeedback };