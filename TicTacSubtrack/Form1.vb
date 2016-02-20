Public Class Form1
    Private Sub Form1_Load(sender As Object, e As EventArgs) Handles MyBase.Load
        voice.SelectVoiceByHints(Speech.Synthesis.VoiceGender.Female)
        voice.SpeakAsync("Hello, I am ready to play some Tic Tac Math with you today. You start first.")
        RadioButton1.Checked = True
        LabelArray.AddRange({Label1, Label2, Label3, Label4, Label5, Label6, Label7, Label8, Label9})
        TextboxArray.AddRange({TextBox1, TextBox2, TextBox3, TextBox4, TextBox5, TextBox6, TextBox7, TextBox8, TextBox9})
        ButtonArray.AddRange({Button1, Button2, Button3, Button4, Button5, Button6, Button7, Button8, Button9})
        PopulateField()
    End Sub

    Private voice As New System.Speech.Synthesis.SpeechSynthesizer()
    Private LabelArray As New Generic.List(Of Label)()
    Private TextboxArray As New Generic.List(Of TextBox)()
    Private ButtonArray As New Generic.List(Of Button)()
    Private Sub PopulateField()
        ComputerValues.Clear()
        Player1Values.Clear()
        Dim allowNegatives As Boolean = CheckBox1.Checked
        For Each t In TextboxArray
            If t IsNot Nothing Then
                t.Text = String.Empty
                t.Visible = True
            End If
        Next
        Dim rand As New Random()

        Dim Max As Integer = Convert.ToInt32(Math.Pow(10, RadioNumberSelected())) - 1
        For Each L In LabelArray
            L.ForeColor = Color.Black
            Dim Number1 As Integer = rand.Next(1, Max)
            Dim Number2 As Integer = rand.Next(1, Max)
            If Not allowNegatives AndAlso Number1 < Number2 Then
                L.Text = String.Concat(Number2.ToString, Environment.NewLine, "-", Number1.ToString)
            Else
                L.Text = String.Concat(Number1.ToString, Environment.NewLine, "-", Number2.ToString)
            End If
            L.Visible = True
        Next
        Button1.Visible = True : Button2.Visible = True : Button3.Visible = True : Button4.Visible = True : Button5.Visible = True : Button6.Visible = True : Button7.Visible = True : Button8.Visible = True : Button9.Visible = True
    End Sub

    Private Function RadioNumberSelected() As Integer
        If RadioButton1.Checked Then Return 1
        If RadioButton2.Checked Then Return 2
        If RadioButton3.Checked Then Return 3
        Return 0
    End Function

    Private Sub RadioButton1_CheckedChanged(sender As Object, e As EventArgs) Handles RadioButton1.CheckedChanged, RadioButton2.CheckedChanged, RadioButton3.CheckedChanged
        If DirectCast(sender, RadioButton).Checked = True Then
            RadioButton1.Checked = (sender Is RadioButton1)
            RadioButton2.Checked = (sender Is RadioButton2)
            RadioButton3.Checked = (sender Is RadioButton3)

            PopulateField()
        End If
    End Sub



    Private Sub Button1_Click(sender As Object, e As EventArgs) Handles Button1.Click, Button2.Click, Button3.Click, Button4.Click, Button5.Click, Button6.Click, Button7.Click, Button8.Click, Button9.Click
        Dim ob As Button = DirectCast(sender, Button)
        Dim intValue As Integer = ButtonArray.IndexOf(ob) + 1 'Integer.Parse(ob.Name.Substring(6))
        Dim SelectedValue As Integer
        'Dim LabelValueToCheck As String = LabelArray(intValue - 1).Text
        If Not String.IsNullOrWhiteSpace(TextboxArray(intValue - 1).Text) AndAlso Integer.TryParse(TextboxArray(intValue - 1).Text, SelectedValue) Then
            Dim Number1, Number2 As Integer
            ParseNumbers(LabelArray(intValue - 1).Text, Number1, Number2)
            Dim value As Integer = Number1 - Number2
            voice.Speak(Number1.ToString & " minus " & Number2 & " equals " & value.ToString)
            ob.Visible = False
            If value = SelectedValue Then
                MarkXO(True, intValue)
            Else
                MarkXO(False, intValue)
            End If
        Else
            voice.SpeakAsync("Oops!. Enter the value in the textbox, and try again.")
        End If
    End Sub

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
        voice.SpeakAsync("My Pick. " & Number1.ToString & " minus " & Number2 & " equals " & (Number1 - Number2).ToString)
        LabelArray(I).Text = "O" : LabelArray(I).ForeColor = Color.Red


    End Sub

    Private Sub ParseNumbers(S As String, ByRef Number1 As Integer, ByRef Number2 As Integer)
        Dim Numbers() As String = S.Split(Environment.NewLine & "-")
        Number1 = Integer.Parse(Numbers(0))
        Number2 = Integer.Parse(Numbers(1).Replace("-", ""))
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


End Class
