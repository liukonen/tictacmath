Imports System.ComponentModel

Public Class Form1
    Private Sub Form1_Load(sender As Object, e As EventArgs) Handles MyBase.Load
        voice.SelectVoiceByHints(Speech.Synthesis.VoiceGender.Female)
        voice.SpeakAsync("Hello, I am ready to play some Tic Tac Math with you today. You start first.")

        LabelArray.AddRange({Label1, Label2, Label3, Label4, Label5, Label6, Label7, Label8, Label9})
        TextboxArray.AddRange({TextBox1, TextBox2, TextBox3, TextBox4, TextBox5, TextBox6, TextBox7, TextBox8, TextBox9})
        ButtonArray.AddRange({Button1, Button2, Button3, Button4, Button5, Button6, Button7, Button8, Button9})
        PopulateField()
    End Sub

    Private voice As New System.Speech.Synthesis.SpeechSynthesizer()
    Private LabelArray As New Generic.List(Of Label)()
    Private TextboxArray As New Generic.List(Of TextBox)()
    Private ButtonArray As New Generic.List(Of Button)()
    Private allowNegatives As Boolean = False
    Private ActiveGameType As GameType = GameType.Subtract

    Private Enum GameType As Byte
        Add
        Subtract
        Multiply
    End Enum

    Private Sub PopulateField()
        Me.Text = "TicTac" & ActiveGameType.ToString()
        ComputerValues.Clear()
        Player1Values.Clear()
        For Each t In TextboxArray
            If t IsNot Nothing Then
                t.Text = String.Empty
                t.Visible = True
            End If
        Next
        Dim rand As New Random()

        Dim Max As Integer = Convert.ToInt32(Math.Pow(10, RadioNumberSelected)) - 1
        For Each L In LabelArray
            L.ForeColor = Color.Black
            Dim Number1 As Integer = rand.Next(1, Max)
            Dim Number2 As Integer = rand.Next(1, Max)
            If Not allowNegatives AndAlso Number1 < Number2 Then
                L.Text = String.Concat(Number2.ToString, Environment.NewLine, GameOperator(ActiveGameType), Number1.ToString)
            Else
                L.Text = String.Concat(Number1.ToString, Environment.NewLine, GameOperator(ActiveGameType), Number2.ToString)
            End If
            L.Visible = True
        Next
        Button1.Visible = True : Button2.Visible = True : Button3.Visible = True : Button4.Visible = True : Button5.Visible = True : Button6.Visible = True : Button7.Visible = True : Button8.Visible = True : Button9.Visible = True
    End Sub

    Private Function GameOperator(gt As GameType) As Char
        Select Case gt
            Case GameType.Multiply
                Return "x"c
            Case GameType.Add
                Return "+"c
            Case Else
                Return "-"c
        End Select
    End Function


    Private RadioNumberSelected As Integer = 1



    Private Sub Button1_Click(sender As Object, e As EventArgs) Handles Button1.Click, Button2.Click, Button3.Click, Button4.Click, Button5.Click, Button6.Click, Button7.Click, Button8.Click, Button9.Click
        Dim ob As Button = DirectCast(sender, Button)
        Dim intValue As Integer = ButtonArray.IndexOf(ob) + 1 'Integer.Parse(ob.Name.Substring(6))
        Dim SelectedValue As Integer
        'Dim LabelValueToCheck As String = LabelArray(intValue - 1).Text
        If Not String.IsNullOrWhiteSpace(TextboxArray(intValue - 1).Text) AndAlso Integer.TryParse(TextboxArray(intValue - 1).Text, SelectedValue) Then
            ob.Visible = False

            Dim Number1, Number2 As Integer
            ParseNumbers(LabelArray(intValue - 1).Text, Number1, Number2)
            Dim value As Integer = CalculateValue(Number1, Number2)
            voice.Speak(Number1.ToString & GetActiveTypesOperatorName & Number2 & " equals " & value.ToString.Replace("-", "negative "))
            If value = SelectedValue Then
                MarkXO(True, intValue)
            Else
                MarkXO(False, intValue)
            End If
        Else
            voice.SpeakAsync("Oops!. Enter the value in the textbox, and try again.")
        End If
    End Sub

    Private Function CalculateValue(number1 As Integer, number2 As Integer)
        Select Case ActiveGameType
            Case GameType.Add
                Return number1 + number2
            Case GameType.Multiply
                Return number1 * number2
            Case Else
                Return number1 - number2
        End Select
    End Function

    Private ReadOnly Property GetActiveTypesOperatorName As String
        Get
            Select Case ActiveGameType
                Case GameType.Add
                    Return " plus "
                Case GameType.Multiply
                    Return " times "
                Case Else
                    Return " minus "
            End Select
        End Get
    End Property


    Private Sub MarkXO(Player As Boolean, ArrayID As Integer)
        Const PlayerWon As String = "You won!"
        Const ComputerWon As String = "The computer won."
        Dim arrayoffset As Integer = ArrayID - 1

        TextboxArray(arrayoffset).Visible = False
        If Player Then
            Player1Values.Add(ArrayID)
            LabelArray(arrayoffset).Text = "X"
            LabelArray(arrayoffset).ForeColor = Color.Blue
            If CheckForWin(Player1Values) Then
                Win(PlayerWon)
            Else
                ComputersTurn()
            End If
        Else
            ComputerValues.Add(ArrayID)
            LabelArray(arrayoffset).Text = "O"
            LabelArray(arrayoffset).ForeColor = Color.Red
            If CheckForWin(ComputerValues) Then
                Win(ComputerWon)
            End If
        End If


    End Sub

    Private Sub ComputersTurn()
        Dim X = (From T As TextBox In TextboxArray Where T.Visible = True Select T).ToArray
        Dim rand As New Random()
        Dim ValueToSelect As Integer = rand.Next(0, X.Count - 1)
        Dim I As Integer = TextboxArray.IndexOf(X(ValueToSelect))

        ButtonArray(I).Visible = False
        TextboxArray(I).Visible = False
        Dim TextToParse As String = LabelArray(I).Text
        Dim Number1, Number2 As Integer
        ParseNumbers(TextToParse, Number1, Number2)
        voice.SpeakAsync("My Pick. " & Number1.ToString & GetActiveTypesOperatorName & Number2 & " equals " & CalculateValue(Number1, Number2).ToString.Replace("-", "negative "))
        LabelArray(I).Text = "O" : LabelArray(I).ForeColor = Color.Red


    End Sub



    Private Sub ParseNumbers(S As String, ByRef Number1 As Integer, ByRef Number2 As Integer)
        Dim Numbers() As String = S.Split(Environment.NewLine & "-")
        Number1 = Integer.Parse(Numbers(0))
        Number2 = Integer.Parse(Numbers(1).Substring(2))
    End Sub

    Private Sub Win(TextToSpeak As String)
        voice.SpeakAsync(TextToSpeak)
        MsgBox(TextToSpeak)
        PopulateField()
    End Sub

    Private Player1Values As New Generic.List(Of Integer)()
    Private ComputerValues As New Generic.List(Of Integer)()

    Private Function CheckForWin(Player As Generic.List(Of Integer)) As Boolean
        If Player.Contains(1) AndAlso Player.Contains(2) AndAlso Player.Contains(3) Then Return True
        If Player.Contains(1) AndAlso Player.Contains(4) AndAlso Player.Contains(7) Then Return True
        If Player.Contains(1) AndAlso Player.Contains(5) AndAlso Player.Contains(9) Then Return True
        If Player.Contains(2) AndAlso Player.Contains(5) AndAlso Player.Contains(8) Then Return True
        If Player.Contains(3) AndAlso Player.Contains(6) AndAlso Player.Contains(9) Then Return True
        If Player.Contains(3) AndAlso Player.Contains(5) AndAlso Player.Contains(7) Then Return True
        If Player.Contains(4) AndAlso Player.Contains(5) AndAlso Player.Contains(6) Then Return True
        If Player.Contains(7) AndAlso Player.Contains(8) AndAlso Player.Contains(9) Then Return True
        Return False
    End Function

    Private Sub YesNoToolStripMenuItem_Click(sender As Object, e As EventArgs) Handles YesToolStripMenuItem.Click, NoToolStripMenuItem.Click
        DirectCast(sender, ToolStripMenuItem).Checked = True
        If DirectCast(sender, ToolStripMenuItem) Is YesToolStripMenuItem Then
            allowNegatives = True
            NoToolStripMenuItem.Checked = False
        Else
            allowNegatives = False
            YesToolStripMenuItem.Checked = False
        End If
        PopulateField()
    End Sub


    Private Sub SToolStripMenuItem_Click(sender As Object, e As EventArgs) Handles SToolStripMenuItem.Click, SToolStripMenuItem1.Click, SToolStripMenuItem2.Click
        Dim ArrayOfStripItems As New Generic.List(Of ToolStripMenuItem)({SToolStripMenuItem, SToolStripMenuItem1, SToolStripMenuItem2})
        Dim castSender As ToolStripItem = DirectCast(sender, ToolStripItem)
        If castSender Is SToolStripMenuItem Then
            RadioNumberSelected = 1
        ElseIf castSender Is SToolStripMenuItem1 Then
            RadioNumberSelected = 2
        ElseIf castSender Is SToolStripMenuItem2 Then
            RadioNumberSelected = 3
        End If
        For Each StripItem As ToolStripMenuItem In ArrayOfStripItems
            StripItem.Checked = (castSender Is StripItem)
        Next
        PopulateField()
    End Sub

    Private Sub Form1_Closing(sender As Object, e As CancelEventArgs) Handles Me.Closing
        voice.Dispose()
    End Sub

    Private Sub ExitToolStripMenuItem1_Click(sender As Object, e As EventArgs) Handles ExitToolStripMenuItem1.Click
        Me.Close()
    End Sub

    Private Sub SubtractionToolStripMenuItem_Click(sender As Object, e As EventArgs) Handles SubtractionToolStripMenuItem.Click, AdditionToolStripMenuItem.Click, MultiplicationToolStripMenuItem.Click
        Dim castSender As ToolStripMenuItem = DirectCast(sender, ToolStripMenuItem)
        Dim arrayList As New Generic.LinkedList(Of ToolStripMenuItem)({SubtractionToolStripMenuItem, AdditionToolStripMenuItem, MultiplicationToolStripMenuItem})
        If castSender Is SubtractionToolStripMenuItem Then ActiveGameType = GameType.Subtract
        If castSender Is AdditionToolStripMenuItem Then ActiveGameType = GameType.Add
        If castSender Is MultiplicationToolStripMenuItem Then ActiveGameType = GameType.Multiply
        For Each T As ToolStripMenuItem In arrayList
            T.Checked = (castSender Is T)
        Next
        PopulateField()
    End Sub

End Class
