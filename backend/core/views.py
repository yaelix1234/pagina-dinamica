from datetime import timedelta, datetime

from django.db.models import Sum
from django.utils import timezone
from rest_framework import viewsets, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Usuario, Categoria, Producto, Cliente, Pedido, DetallePedido
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from .serializers import (
    UsuarioSerializer, CategoriaSerializer, ProductoSerializer,
    ClienteSerializer, PedidoSerializer, DetallePedidoSerializer,
    LoginSerializer,
)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'correo']


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre']


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.select_related('categoria').all()
    serializer_class = ProductoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['categoria', 'estado']
    search_fields = ['nombre']


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre_completo', 'correo', 'telefono']


class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.select_related('cliente').prefetch_related('detalles__producto').all()
    serializer_class = PedidoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['estado', 'cliente']


class DetallePedidoViewSet(viewsets.ModelViewSet):
    queryset = DetallePedido.objects.select_related('producto', 'pedido').all()
    serializer_class = DetallePedidoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['pedido', 'producto']


class DashboardResumenView(APIView):
    def get(self, request):
        ahora = timezone.now()
        inicio_mes = ahora.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        inicio_hoy = ahora.replace(hour=0, minute=0, second=0, microsecond=0)

        ingresos_mes = Pedido.objects.filter(
            fecha__gte=inicio_mes
        ).exclude(estado='cancelado').aggregate(total=Sum('total'))['total'] or 0

        pedidos_hoy = Pedido.objects.filter(fecha__gte=inicio_hoy).count()
        total_clientes = Cliente.objects.count()
        productos_inventario_bajo = Producto.objects.filter(existencias__lt=5).count()

        return Response({
            'ingresos_mes': ingresos_mes,
            'pedidos_hoy': pedidos_hoy,
            'total_clientes': total_clientes,
            'productos_inventario_bajo': productos_inventario_bajo,
        })


class VentasUltimosSieteDiasView(APIView):
    def get(self, request):
        hoy = timezone.localdate()
        datos = []

        for i in range(6, -1, -1):
            dia = hoy - timedelta(days=i)
            inicio_dia = timezone.make_aware(datetime.combine(dia, datetime.min.time()))
            fin_dia = timezone.make_aware(datetime.combine(dia, datetime.max.time()))

            total_dia = Pedido.objects.filter(
                fecha__gte=inicio_dia, fecha__lte=fin_dia
            ).exclude(estado='cancelado').aggregate(total=Sum('total'))['total'] or 0
            datos.append({'fecha': dia.isoformat(), 'total': total_dia})

        return Response(datos)


class ProductosMasVendidosView(APIView):
    def get(self, request):
        productos = (
            DetallePedido.objects
            .exclude(pedido__estado='cancelado')
            .values('producto__id', 'producto__nombre')
            .annotate(cantidad_vendida=Sum('cantidad'))
            .order_by('-cantidad_vendida')[:5]
        )

        resultado = [
            {
                'producto_id': p['producto__id'],
                'nombre': p['producto__nombre'],
                'cantidad_vendida': p['cantidad_vendida'],
            }
            for p in productos
        ]
        return Response(resultado)


class ProductosRecientesView(APIView):
    def get(self, request):
        productos = Producto.objects.order_by('-fecha_creacion')[:5]
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data)


class InventarioPorAtenderView(APIView):
    def get(self, request):
        productos = Producto.objects.filter(existencias__lt=5).order_by('existencias')
        resultado = [
            {'id': p.id, 'nombre': p.nombre, 'existencias': p.existencias}
            for p in productos
        ]
        return Response(resultado)
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        correo = serializer.validated_data['correo']
        password = serializer.validated_data['password']

        try:
            usuario = Usuario.objects.get(correo=correo)
        except Usuario.DoesNotExist:
            return Response({'detail': 'Correo o contraseña incorrectos.'}, status=401)

        if usuario.estado != 'activo':
            return Response({'detail': 'Este usuario está inactivo.'}, status=403)

        if not usuario.check_password(password):
            return Response({'detail': 'Correo o contraseña incorrectos.'}, status=401)

        from django.contrib.auth.models import User
        django_user, created = User.objects.get_or_create(
            username=f'usuario_{usuario.id}',
            defaults={'email': usuario.correo},
        )
        token, _ = Token.objects.get_or_create(user=django_user)

        return Response({
            'token': token.key,
            'usuario': UsuarioSerializer(usuario).data,
        })