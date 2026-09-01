import pdfMake from 'pdfmake/build/pdfmake'
import vfsFonts from 'pdfmake/build/vfs_fonts'

pdfMake.addVirtualFileSystem(vfsFonts)

class PDFUtils {
  static createPdfForRecipe(item) {

    const ingred = [
      [
        { text: 'Menge', bold: true },
        { text: 'Zutat', bold: true },
      ],
    ].concat(
      item.ingredients.map(ingredient => {
        return [ingredient.name, ingredient.amount]
      })
    )

    const docDefinition = {
      footer: {
        columns: [{ text: 'kochbuch.sthomas.ch', alignment: 'center' }],
      },

      content: [
        {
          columns: [
            { width: '*', text: '' },
            {
              text: item.title,
              bold: true,
              decoration: 'underline',
              fontSize: 24,
              alignment: 'center',
            },
            { width: '*', text: '' },
          ],
        },
        {
          columns: [
            { width: '*', text: '' },
            {
              text: 'Zutaten',
              bold: true,
              decoration: 'underline',
              fontSize: 18,
              alignment: 'center',
            },
            { width: '*', text: '' },
          ],
        },
        {
          columns: [
            { width: '20%', text: '' },
            {
              layout: 'lightHorizontalLines',
              table: {
                headerRows: 1,
                widths: ['auto', 'auto'],

                body: ingred,
                alignment: 'center',
              },
            },
            { width: '20%', text: '' },
          ],
        },
        {
          columns: [
            { width: '*', text: '' },
            {
              text: 'Beschreibung',
              bold: true,
              decoration: 'underline',
              fontSize: 18,
              alignment: 'center',
            },
            { width: '*', text: '' },
          ],
        },
        {
          text: item.description,
          alignment: 'center',
        },
      ],
    }

    pdfMake.createPdf(docDefinition).download(`${item.title}.pdf`)
  }
}

export default PDFUtils
