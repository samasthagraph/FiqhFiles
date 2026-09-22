import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Export a single Question / Mas'ala as a formatted .docx document
 */
export async function exportSingleQuestionToDoc(question) {
    if (!question) return;

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: "Fiqh File - Official Mas'ala Record",
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 300 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Date: ", bold: true }),
                        new TextRun(new Date(question.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })),
                        new TextRun({ text: "    |    Madhhab: ", bold: true }),
                        new TextRun(question.madhhab || 'General'),
                        new TextRun({ text: "    |    Status: ", bold: true }),
                        new TextRun(question.status || 'Pending'),
                    ],
                    spacing: { after: 200 }
                }),
                ...(question.name ? [
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Submitted By: ", bold: true }),
                            new TextRun(`${question.name} ${question.phone ? `(${question.phone})` : ''}`)
                        ],
                        spacing: { after: 300 }
                    })
                ] : []),
                new Paragraph({
                    text: "Question / ചോദ്യം:",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 150 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: question.questionText || '',
                            italics: true,
                            size: 24
                        })
                    ],
                    spacing: { after: 300 }
                }),
                new Paragraph({
                    text: "Official Answer / മറുപടി:",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 150 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: question.answerText || 'Awaiting scholar response / മറുപടി നൽകിയിട്ടില്ല.',
                            size: 24
                        })
                    ],
                    spacing: { after: 400 }
                }),
                ...(question.comments && question.comments.length > 0 ? [
                    new Paragraph({
                        text: `Discussion & Comments (${question.comments.length}):`,
                        heading: HeadingLevel.HEADING_3,
                        spacing: { before: 200, after: 150 }
                    }),
                    ...question.comments.map((c, i) => 
                        new Paragraph({
                            children: [
                                new TextRun({ text: `${i + 1}. ${c.name} (${new Date(c.createdAt).toLocaleDateString()}): `, bold: true }),
                                new TextRun({ text: c.text })
                            ],
                            spacing: { after: 100 }
                        })
                    )
                ] : []),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Generated from Fiqh File Platform (fiqhfiles.samasthagraph.com)",
                            size: 16,
                            color: "888888",
                            italics: true
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 400 }
                })
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    const safeTitle = (question.questionText || 'masala').slice(0, 30).replace(/[^a-zA-Z0-9_\u0D00-\u0D7F]/g, '_');
    saveAs(blob, `Masala_${question.id || question._id || 'record'}_${safeTitle}.docx`);
}

/**
 * Export a list of Questions / Mas'alas as a consolidated .docx document
 */
export async function exportQuestionsListToDoc(questions, title = "Fiqh File - Questions Export") {
    if (!questions || questions.length === 0) return;

    const sections = [];

    // Header
    const docChildren = [
        new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
        }),
        new Paragraph({
            children: [
                new TextRun({ text: "Generated on: ", bold: true }),
                new TextRun(new Date().toLocaleString()),
                new TextRun({ text: `    |    Total Records: ${questions.length}`, bold: true })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        })
    ];

    // Add each question
    questions.forEach((q, index) => {
        docChildren.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `#${index + 1}. [${q.madhhab || 'General'}] [${q.status || 'Pending'}] - ${q.name || 'Anonymous'} ${q.phone ? `(${q.phone})` : ''}`,
                        bold: true,
                        size: 24,
                        color: "1e3a8a"
                    })
                ],
                spacing: { before: 300, after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Date: ", bold: true }),
                    new TextRun(new Date(q.createdAt).toLocaleDateString()),
                    ...(q.isUrgent ? [new TextRun({ text: "  |  [URGENT PRIORITY]", bold: true, color: "DC2626" })] : [])
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Question: ", bold: true }),
                    new TextRun({ text: q.questionText || '', italics: true })
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Answer: ", bold: true }),
                    new TextRun({ text: q.answerText || 'Pending answer' })
                ],
                spacing: { after: 250 }
            })
        );
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: docChildren
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `FiqhFiles_Questions_Export_${new Date().toISOString().slice(0, 10)}.docx`);
}
