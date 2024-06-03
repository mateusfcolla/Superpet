package mail

import (
	"super-pet-delivery/util"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSendEmailWithZoho(t *testing.T) {
	if testing.Short() {
		t.Skip()
	}

	config, err := util.LoadConfig("..")
	require.NoError(t, err)

	sender := NewGmailSender(config.EmailSenderName, config.EmailSenderAddress, config.EmailSenderPassword)

	subject := "Test email"
	content := `
	<h1>Oi Mãe</h1>
	<p>This is a test email</p>
	`
	to := []string{"luankds@gmail.com"}
	//attachFiles := []string{"../README.md"}

	err = sender.SendEmail(subject, content, to, nil, nil, nil)
	require.NoError(t, err)

}
