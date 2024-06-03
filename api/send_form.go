package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/smtp"
	"net/url"

	"github.com/gin-gonic/gin"
	"github.com/jordan-wright/email"
)

const (
	smtpAuthAddress   = "smtp.zoho.com"
	smtpServerAddress = "smtp.zoho.com:587"
)

type EmailSender interface {
	SendEmail(
		subject string,
		content string,
		to []string,
		cc []string,
		bcc []string,
		attachFiles []string,
	) error
}

type GmailSender struct {
	name              string
	fromEmailAddress  string
	fromEmailPassword string
}

func NewGmailSender(name string, fromEmailAddress string, fromEmailPassword string) EmailSender {
	return &GmailSender{
		name:              name,
		fromEmailAddress:  fromEmailAddress,
		fromEmailPassword: fromEmailPassword,
	}
}

func (sender *GmailSender) SendEmail(
	subject string,
	content string,
	to []string,
	cc []string,
	bcc []string,
	attachFiles []string,
) error {
	e := email.NewEmail()
	e.From = fmt.Sprintf("%s <%s>", sender.name, sender.fromEmailAddress)
	e.Subject = subject
	e.HTML = []byte(content)
	e.To = to
	e.Cc = cc
	e.Bcc = bcc

	for _, f := range attachFiles {
		_, err := e.AttachFile(f)
		if err != nil {
			return fmt.Errorf("failed to attach file %s: %w", f, err)
		}
	}

	smtpAuth := smtp.PlainAuth("", sender.fromEmailAddress, sender.fromEmailPassword, smtpAuthAddress)
	return e.Send(smtpServerAddress, smtpAuth)
}

type FormData struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email" binding:"required"`
	Phone   string `json:"phone" binding:"required"`
	Message string `json:"message" binding:"required"`
	Captcha string `json:"token" binding:"required"`
}

func (server *Server) HandleForm(ctx *gin.Context) {
	var formData FormData

	if err := ctx.ShouldBindJSON(&formData); err != nil {
		fmt.Println("Error binding JSON:", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify the reCAPTCHA token
	resp, err := http.PostForm("https://www.google.com/recaptcha/api/siteverify", url.Values{
		"secret":   {"6LdSvaopAAAAAKj0NDLNQxqDeBwU_BwTrtFt4LOl"},
		"response": {formData.Captcha},
	})
	if err != nil {
		fmt.Println("Error verifying reCAPTCHA:", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify reCAPTCHA"})
		return
	}
	defer resp.Body.Close()

	var result struct {
		Success bool `json:"success"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		fmt.Println("Error decoding reCAPTCHA response:", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode reCAPTCHA response"})
		return
	}

	if !result.Success {
		fmt.Println("Failed reCAPTCHA verification")
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed reCAPTCHA verification"})
		return
	}

	emailSender := NewGmailSender("Super Pet Delivery", server.config.EmailSenderAddress, server.config.EmailSenderPassword)

	// Handle the form data
	subject := "Novo Formulário de contato recebido no Super Pet Delivery"
	content := fmt.Sprintf(`
	<html>
		<body>
			<h1>Nova submissão de formulário de contato</h1>
			<p><strong>Nome:</strong> %s</p>
			<p><strong>Email:</strong> %s</p>
			<p><strong>Telefone:</strong> %s</p>
			<p><strong>Mensagem:</strong> %s</p>
		</body>
	</html>
	`,
		formData.Name, formData.Email, formData.Phone, formData.Message)

	to := []string{"luankds@gmail.com"} // replace with your email address
	err = emailSender.SendEmail(subject, content, to, nil, nil, nil)
	if err != nil {
		fmt.Println("Error sending email:", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
		return
	}

	fmt.Println("Email sent successfully")
	ctx.JSON(http.StatusOK, gin.H{"status": "Form data received successfully"})
}
