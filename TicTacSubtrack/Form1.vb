Imports System.ComponentModel

Public Class Form1

#Region "Private Objects"
    'Private voice As New System.Speech.Synthesis.SpeechSynthesizer()
    Private LabelArray As New Generic.List(Of Label)()
    Private TextboxArray As New Generic.List(Of TextBox)()
    Private ButtonArray As New Generic.List(Of Button)()
    Private allowNegatives As Boolean = False
    Private ActiveGameType As GameType = GameType.Subtract
    Private RadioNumberSelected As Integer = 1
    Private Player1Values As New Generic.List(Of Integer)()
    Private ComputerValues As New Generic.List(Of Integer)()
#End Region

#Region "Enum Types"
    Private Enum GameType As Byte
        Add
        Subtract
        Multiply
        Divide
    End Enum
#End Region

#Region "Properties"
    Private ReadOnly Property GameOperator As Char
        Get
            Select Case ActiveGameType
                Case GameType.Multiply
                    Return "x"c
                Case GameType.Add
                    Return "+"c
                Case GameType.Divide
                    Return "÷"c
                Case Else
                    Return "-"c
            End Select
        End Get
    End Property

    Private ReadOnly Property GetActiveTypesOperatorName As String
        Get
            Select Case ActiveGameType
                Case GameType.Add
                    Return " plus "
                Case GameType.Multiply
                    Return " times "
                Case GameType.Divide
                    Return " divided by "
                Case Else
                    Return " minus "
            End Select
        End Get
    End Property
#End Region

#Region "Event Handles"
    Private Sub Button1_Click(sender As Object, e As EventArgs) Handles Button1.Click, Button2.Click, Button3.Click, Button4.Click, Button5.Click, Button6.Click, Button7.Click, Button8.Click, Button9.Click
        Dim ob As Button = DirectCast(sender, Button)
        Dim intValue As Integer = ButtonArray.IndexOf(ob) + 1
        Dim SelectedValue As Integer
        If Not String.IsNullOrWhiteSpace(TextboxArray(intValue - 1).Text) AndAlso Integer.TryParse(TextboxArray(intValue - 1).Text, SelectedValue) Then
            ob.Visible = False

            Dim Number1, Number2 As Integer
            ParseNumbers(LabelArray(intValue - 1).Text, Number1, Number2)
            Dim value As Integer = CalculateValue(Number1, Number2)
            'voice.Speak(Number1.ToString & GetActiveTypesOperatorName & Number2 & " equals " & value.ToString.Replace("-", "negative "))

            MarkXO((value = SelectedValue), intValue)
        Else
           ' voice.SpeakAsync("Oops!. Enter the value in the textbox, and try again.")
        End If
    End Sub

#End Region

#Region "Supporting Methods"

    Private Sub PopulateField()
        Me.Text = "Tic Tac " & ActiveGameType.ToString()
        ComputerValues.Clear()
        Player1Values.Clear()

        Dim rand As New Random()
        Dim Max As Integer = Convert.ToInt32(Math.Pow(10, RadioNumberSelected)) - 1

        For I As Integer = 0 To 8
            If TextboxArray(I) IsNot Nothing Then
                TextboxArray(I).Text = String.Empty
                TextboxArray(I).Visible = True
            End If
            Dim Numbers As Integer() = NumberArray(rand, Max)
            LabelArray(I).ForeColor = Color.Black
            LabelArray(I).Text = String.Concat(Numbers(0), Environment.NewLine, GameOperator, Numbers(1))
            ButtonArray(I).Visible = True
        Next
    End Sub

    Private Function NumberArray(X As Random, max As Integer) As Integer()
        Dim value As New KeyValuePair(Of Integer, Integer)(X.Next(1, max), X.Next(1, max))
        If ActiveGameType = GameType.Divide Then value = New KeyValuePair(Of Integer, Integer)(value.Key * value.Value, value.Value)
        If ActiveGameType = GameType.Subtract AndAlso Not allowNegatives AndAlso value.Key < value.Value Then value = New KeyValuePair(Of Integer, Integer)(value.Value, value.Key)
        Return New Integer() {value.Key, value.Value}
    End Function

    Private Shared Function CoinFlip() As Boolean
        Dim coin As New Random()
        Return coin.Next(0, 2) = 1
    End Function

    Private Function CalculateValue(number1 As Integer, number2 As Integer) As Integer
        Select Case ActiveGameType
            Case GameType.Add
                Return number1 + number2
            Case GameType.Multiply
                Return number1 * number2
            Case GameType.Divide
                Return Convert.ToInt32(number1 / number2)
            Case Else
                Return number1 - number2
        End Select
    End Function

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
            ElseIf Not CheckTie() Then
                ComputersTurn()
            End If
        Else
            ComputerValues.Add(ArrayID)
            LabelArray(arrayoffset).Text = "O"
            LabelArray(arrayoffset).ForeColor = Color.Red
            If CheckForWin(ComputerValues) Then
                Win(ComputerWon)
            End If
            CheckTie()

        End If
    End Sub

    Private Function CheckTie() As Boolean
        If ComputerValues.Count + Player1Values.Count = 9 Then
            Win("Tie Game")
            Return True
        End If
        Return False
    End Function

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
       ' voice.SpeakAsync(("My Pick. " & Number1.ToString & GetActiveTypesOperatorName & Number2 & " equals " & CalculateValue(Number1, Number2).ToString).Replace("-", "negative "))
        MarkXO(False, I + 1)
    End Sub

    Private Sub ParseNumbers(S As String, ByRef Number1 As Integer, ByRef Number2 As Integer)
        Dim Numbers() As String = S.Split(GameOperator)
        Number1 = Integer.Parse(Numbers(0))
        Number2 = Integer.Parse(Numbers(1).Replace(GameOperator, " "c))
    End Sub

    Private Sub Win(TextToSpeak As String)
        'voice.SpeakAsync(TextToSpeak)
        MsgBox(TextToSpeak)
        PopulateField()
    End Sub

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

#End Region

#Region "Options Event Handles"
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

    Private Sub SubtractionToolStripMenuItem_Click(sender As Object, e As EventArgs) Handles SubtractionToolStripMenuItem.Click, AdditionToolStripMenuItem.Click, MultiplicationToolStripMenuItem.Click, DivisionToolStripMenuItem.Click
        Dim castSender As ToolStripMenuItem = DirectCast(sender, ToolStripMenuItem)
        Dim arrayList As New Generic.LinkedList(Of ToolStripMenuItem)({SubtractionToolStripMenuItem, AdditionToolStripMenuItem, MultiplicationToolStripMenuItem})
        If castSender Is SubtractionToolStripMenuItem Then ActiveGameType = GameType.Subtract
        If castSender Is AdditionToolStripMenuItem Then ActiveGameType = GameType.Add
        If castSender Is MultiplicationToolStripMenuItem Then ActiveGameType = GameType.Multiply
        If castSender Is DivisionToolStripMenuItem Then ActiveGameType = GameType.Divide
        For Each T As ToolStripMenuItem In arrayList
            T.Checked = (castSender Is T)
        Next
        PopulateField()
    End Sub
#End Region

#Region "Form Events"

    Private Sub Form1_Load(sender As Object, e As EventArgs) Handles MyBase.Load
        'voice.SelectVoiceByHints(Speech.Synthesis.VoiceGender.Female)
        'voice.SpeakAsync("Hello, I am ready to play some Tic Tac Math with you today. You start first.")
        LabelArray.AddRange({Label1, Label2, Label3, Label4, Label5, Label6, Label7, Label8, Label9})
        TextboxArray.AddRange({TextBox1, TextBox2, TextBox3, TextBox4, TextBox5, TextBox6, TextBox7, TextBox8, TextBox9})
        ButtonArray.AddRange({Button1, Button2, Button3, Button4, Button5, Button6, Button7, Button8, Button9})
        PopulateField()
    End Sub
    Private Sub Form1_Closing(sender As Object, e As CancelEventArgs) Handles Me.Closing
        'voice.Dispose()
    End Sub

    Private Sub ExitToolStripMenuItem1_Click(sender As Object, e As EventArgs) Handles ExitToolStripMenuItem1.Click
        Me.Close()
    End Sub


#End Region

End Class
