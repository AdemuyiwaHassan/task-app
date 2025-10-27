// __mocks__/resend.js
const mockResend = jest.createMockFromModule("resend");

mockResend.Resend = jest.fn().mockImplementation(() => ({
  emails: {
    send: jest.fn().mockResolvedValue({
      data: { id: "test-email-id" },
    }),
  },
}));

module.exports = mockResend;
