package api

import (
	"bytes"
	"fmt"
	"html/template"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
	db "super-pet-delivery/db/sqlc"
	"time"

	"github.com/gin-gonic/gin"
)

type Sale struct {
	ID          int64     `json:"sale_id"`
	ClientID    int64     `json:"client_id"`
	Product     string    `json:"product"`
	Price       float64   `json:"price"`
	Observation string    `json:"observation"`
	CreatedAt   time.Time `json:"created_at"`
}

type Client struct {
	ID                  int64  `json:"id"`
	FullName            string `json:"full_name"`
	PhoneWhatsApp       string `json:"phone_whatsapp"`
	PhoneLine           string `json:"phone_line"`
	PetName             string `json:"pet_name"`
	PetBreed            string `json:"pet_breed"`
	AddressStreet       string `json:"address_street"`
	AddressCity         string `json:"address_city"`
	AddressNumber       string `json:"address_number"`
	AddressNeighborhood string `json:"address_neighborhood"`
	AddressReference    string `json:"address_reference"`
}

// type of is either delivery or simple
type createPdfRequest struct {
	SaleId    []int64 `json:"sale_id" validate:"required"`
	TypeOfPdf string  `json:"type_of_pdf" validate:"required" `
}

type Report struct {
	Sale
	Client
}

func (server *Server) fetchSaleData(saleID int64, ctx *gin.Context) (*db.Sale, error) {
	// Use your custom store method to fetch sale data
	sale, err := server.store.GetSale(ctx, saleID)
	if err != nil {
		return nil, err
	}

	// Return a pointer to the sale data
	return &sale, nil
}

func (server *Server) fetchClientData(clientID int64, ctx *gin.Context) (*db.Client, error) {
	// Use your custom store method to fetch client data
	client, err := server.store.GetClient(ctx, clientID)
	if err != nil {
		return nil, err
	}

	// Return a pointer to the client data
	return &client, nil
}

func (server *Server) createPdf(ctx *gin.Context) {
	var req createPdfRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var report []Report
	var htmlTemplate string

	//result := req.saleID[0]

	for _, saleid := range req.SaleId {
		fmt.Printf("\n sale Id: %d", saleid)
	}

	//report
	for _, requestSaleId := range req.SaleId {
		sale, err := server.fetchSaleData(requestSaleId, ctx)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sale data"})
			return
		}

		saleArg := Sale{
			ID:          sale.ID,
			ClientID:    sale.ClientID,
			Product:     sale.Product,
			Price:       sale.Price,
			Observation: sale.Observation,
			CreatedAt:   sale.CreatedAt,
		}

		// Fetch client data using the client_id from the sale response
		client, err := server.fetchClientData(sale.ClientID, ctx)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch client data"})
			return
		}

		clientArg := Client{
			ID:                  client.ID,
			FullName:            client.FullName,
			PhoneWhatsApp:       client.PhoneWhatsapp,
			PhoneLine:           client.PhoneLine,
			PetName:             client.PetName,
			PetBreed:            client.PetBreed,
			AddressStreet:       client.AddressStreet,
			AddressCity:         client.AddressCity,
			AddressNumber:       client.AddressNumber,
			AddressNeighborhood: client.AddressNeighborhood,
			AddressReference:    client.AddressReference,
		}

		// Create a new Report entry and assign the dereferenced Sale
		reportEntry := Report{
			Sale:   saleArg,   // Dereference the pointer here
			Client: clientArg, // You need to fetch client data and assign it here
		}

		log.Printf("Report Entry: %+v\n", reportEntry)

		// Append the Report entry to the report slice
		report = append(report, reportEntry)

		log.Printf("Report: %+v\n", report)
	}

	// Create a new buffer to store the HTML output
	var htmlBuffer = new(strings.Builder)

	switch req.TypeOfPdf {
	case "delivery":
		// Define the HTML template with a loop for sections
		htmlTemplate = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>NOTA DE ENTREGA</title>
				<style>
					body {
						font-family: Verdana, sans-serif;
						font-size: 15px;
					}
					table {
						width: 100%;
						border-collapse: collapse;
					}
					tr.sales-header{
						border: 0;
						background-color: #f3f3f3;
					}
					tr.sales-header td{
						border: 0;
					}
					th,
					td {
						border: 1px solid black;
						padding: 5px;
						text-align: left;
					}
					.data-title {
						font-weight: 600;
					}
					.center {
						text-align: center;
					}
					.quarter {
						width: 25%;
					}
				</style>
				<meta charset="UTF-8">
			</head>
			<body>
				<div class="center">
					<h1 style="margin: 5px; font-size: 21px;">NOTA DE ENTREGA</h1>
				</div>
				<table>
					<tr>
						<td class="quarter data-title">Data</td>
						<td class="quarter"></td>
						<td class="quarter data-title">Motorista</td>
						<td class="quarter"></td>
					</tr>
					{{range .Reports}}
					<tr class="sales-header">
						<td colspan="4" class="center"><h2 style="margin: 0;">Venda</h2></td>
					</tr>
					<tr>
						<td class="quarter data-title">Produto:</td>
						<td colspan="3">{{.Sale.Product}}</td>
					</tr>
					<tr>
						<td class="quarter data-title">Preço:</td>
						<td>{{.Sale.Price}}</td>
						<td class="data-title">Criado em:</td>
						<td>{{.Sale.CreatedAt.Format "02/01/2006, 15:04"}}</td>
					</tr>
					<tr>
						<td class="quarter data-title">Nome:</td>
						<td colspan="3">{{.Client.FullName}}</td>
					</tr>
					<tr>
						<td class="quarter data-title">Rua:</td>
						<td colspan="3">{{.Client.AddressStreet}}</td>
					</tr>
					<tr>
						<td class="quarter data-title">Bairro:</td>
						<td>{{.Client.AddressNeighborhood}}</td>
						<td class="data-title">Numero:</td>
						<td>{{.Client.AddressNumber}}</td>
					</tr>
					<tr>
						<td class="quarter data-title">WhatsApp:</td>
						<td>{{.Client.PhoneWhatsApp}}</td>
						<td class="data-title">Telefone:</td>
						<td>{{.Client.PhoneLine}}</td>
					</tr>
					<tr>
						<td class="quarter data-title">Pet:</td>
						<td>{{.Client.PetName}}</td>
						<td class="data-title">Raça/tipo:</td>
						<td>{{.Client.PetBreed}}</td>
					</tr>
					<tr>
						<td class="quarter data-title">Referência:</td>
						<td>{{.Client.AddressReference}}</td>
						<td class="data-title">ID:</td>
						<td>{{.Client.ID}}</td>
					</tr>
					<tr>
						<td class="quarter data-title">Observação:</td>
						<td>{{.Sale.Observation}}</td>
						<td class="data-title">Cidade:</td>
						<td>{{.Client.AddressCity}}</td>
					</tr>
					{{end}}
				</table>
			</body>
			</html>`
	case "simple":
		htmlTemplate = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Relatório de vendas</title>
				<style>
					body {
						font-family: Verdana, sans-serif;
						font-size: 15px;
					}
					table {
						width: 100%;
						border-collapse: collapse;
					}
					tr.sales-header{
						border: 0;
						background-color: #f3f3f3;
					}
					tr.sales-header td{
						border: 0;
					}
					th,
					td {
						border: 1px solid black;
						padding: 5px;
						text-align: left;
					}
					.data-title {
						font-weight: 600;
					}
					.center {
						text-align: center;
					}
					.fith {
						width: 20%;
					}
				</style>
				<meta charset="UTF-8">
			</head>
			<body>
				<div class="center">
					<h1 style="margin: 5px; font-size: 21px;">RELATÓRIO DE VENDAS</h1>
				</div>
				<table>
					<tr>
						<td class="fith data-title">Nome</td>
						<td class="fith data-title">Whatsapp</td>
						<td class="fith data-title">Criado em</td>
						<td class="fith data-title">Produto</td>
						<td class="fith data-title">Preço</td>
					</tr>
					{{range .Reports}}
						<tr>
							<td class="fith">{{.Client.FullName}}</td>
							<td class="fith">{{.Client.PhoneWhatsApp}}</td>
							<td class="fith">{{.Sale.CreatedAt.Format "02/01/2006, 15:04"}}</td>
							<td class="fith">{{.Sale.Product}}</td>
							<td class="fith">{{.Sale.Price}}</td>
						</tr>
					{{end}}
				</table>
			</body>
			</html>`
	}

	// Parse the HTML template
	tmpl, err := template.New("pdf").Parse(htmlTemplate)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse HTML template"})
		return
	}

	fmt.Println("parsed template")

	// Create a structure to pass to the template
	templateData := struct {
		Reports []Report
	}{
		Reports: report,
	}

	fmt.Println("template data")

	// Execute the template with the data and write to the buffer
	err = tmpl.Execute(htmlBuffer, templateData)
	if err != nil {
		log.Println("Error executing template:", err) // Log the error
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to execute HTML template"})
		return
	}

	fmt.Println("executed template")

	// Save the generated HTML to a single file
	filePath := "api/pdf/index.html"
	err = os.WriteFile(filePath, []byte(htmlBuffer.String()), 0644)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save HTML file"})
		return
	}

	fmt.Println("saved file")

	// For demonstration purposes, you can print the HTML to the console
	fmt.Println(htmlBuffer.String())

	// Introduce a delay (e.g., 1 second) before starting the Gotenberg command
	time.Sleep(1 * time.Second)

	// Get the current time
	currentTime := time.Now()

	// Format the current time as a string and use it as the file name
	fileName := currentTime.Format("2006-01-02_15-04-05") + ".pdf"

	// Use Gotenberg to convert the HTML to PDF, including the image parameter
	pdfFilePath := fileName
	err2 := convertHTMLToPDF(filePath, "api/pdf/img.png", pdfFilePath)
	if err2 != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to convert HTML to PDF using Go"})
		return
	}

	// Return the PDF file as a response
	//ctx.JSON(http.StatusOK, report)
	ctx.File(pdfFilePath)
}

func convertHTMLToPDF(filePath, imgPath, pdfPath string) error {
	// Create a buffer to store the form data
	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)

	// Add the HTML file
	htmlFile, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer htmlFile.Close()

	htmlPart, err := writer.CreateFormFile("files", "index.html")
	if err != nil {
		return err
	}
	_, err = io.Copy(htmlPart, htmlFile)
	if err != nil {
		return err
	}

	// Add the image file
	imgFile, err := os.Open(imgPath)
	if err != nil {
		return err
	}
	defer imgFile.Close()

	imgPart, err := writer.CreateFormFile("files", "img.png")
	if err != nil {
		return err
	}
	_, err = io.Copy(imgPart, imgFile)
	if err != nil {
		return err
	}

	// Close the multipart writer
	writer.Close()

	// Create a POST request to Gotenberg
	req, err := http.NewRequest("POST", "http://superpetdelivery.com.br:3000/forms/chromium/convert/html", &requestBody)
	if err != nil {
		return err
	}

	// Set the content type for the request
	req.Header.Set("Content-Type", writer.FormDataContentType())

	// Send the POST request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Check if the request was successful
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("api request failed with status code: %d", resp.StatusCode)
	}

	// Create the PDF file
	pdfFile, err := os.Create(pdfPath)
	if err != nil {
		return err
	}

	// Copy the response body (PDF content) to the PDF file
	_, err = io.Copy(pdfFile, resp.Body)
	if err != nil {
		pdfFile.Close()
		return err
	}

	// Close the PDF file
	err = pdfFile.Close()
	if err != nil {
		return err
	}

	// Schedule the deletion of the PDF file after 3 seconds
	time.AfterFunc(3*time.Second, func() {
		err := os.Remove(pdfPath)
		log.Printf("deleted PDF file: %s", pdfPath)
		if err != nil {
			log.Printf("failed to delete PDF file: %v", err)
		}
	})
	return nil
}

/* curl \
--request POST 'http://pdf-generator:3000/forms/chromium/convert/html' \
--form 'files=@"api/pdf/index.html"' \
--form 'files=@"api/pdf/img.png"' \
-o test.pdf */
